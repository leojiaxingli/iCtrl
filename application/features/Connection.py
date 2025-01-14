import select
import socketserver
import threading
from io import StringIO

import paramiko


class Handler(socketserver.BaseRequestHandler):
    def handle(self):
        try:
            chan = self.server.ssh_transport.open_channel(
                "direct-tcpip",
                ("127.0.0.1", self.server.chain_port),
                self.request.getpeername(),
            )
        except Exception as e:
            return False, "Incoming request to %s:%d failed: %s" % (
                "127.0.0.1", self.server.chain_port, repr(e))

        print(
            "Connected!  Tunnel open %r -> %r -> %r"
            % (
                self.request.getpeername(),
                chan.getpeername(),
                ("127.0.0.1", self.server.chain_port),
            )
        )

        try:
            while True:
                r, _, _ = select.select([self.request, chan], [], [])
                if self.request in r:
                    data = self.request.recv(1024)
                    if len(data) == 0:
                        break
                    chan.send(data)
                if chan in r:
                    data = chan.recv(1024)
                    if len(data) == 0:
                        break
                    self.request.send(data)
        except Exception as e:
            print(e)

        try:
            chan.close()
            self.server.shutdown()
        except Exception as e:
            print(e)


class ForwardServer(socketserver.ThreadingTCPServer):
    daemon_threads = True
    allow_reuse_address = True


class Connection:
    def __init__(self):
        self.client = paramiko.SSHClient()
        self.client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        self.host = ""

    def __del__(self):
        print('Connection::__del__')
        self.client.close()
        del self.client

    def connect(self, host, username, password=None, key_filename=None, private_key_str=None):
        try:
            if password is not None:
                self.client.connect(host, username=username, password=password, timeout=15)
            elif key_filename is not None:
                self.client.connect(host, username=username, key_filename=key_filename, timeout=15)
            elif private_key_str is not None:
                pkey = paramiko.RSAKey.from_private_key(StringIO(private_key_str))
                self.client.connect(host, username=username, pkey=pkey, timeout=15)
            else:
                # TODO: read the docs and the RFC to check whether this is allowed
                raise ValueError("Connection: no valid SSH auth given.")
        except Exception as e:
            # raise e
            # print('Connection::connect() exception:')
            return False, str(e)

        self.host = host

        return True, ''

    @staticmethod
    def ssh_keygen(key_filename=None, key_file_obj=None, public_key_comment=''):
        """ Generate and save an RSA SSH private key on the local machine, return a public key
        :param key_filename: path to which the private key should be saved
        :param key_file_obj: file object in which the private key should be saved
        :param public_key_comment: comment to be added at the end of the public key record
        :return: passphrase of the public key
        """
        # 3072 is the default size of OpenSSH keys
        rsa_key = paramiko.RSAKey.generate(3072)

        # save the private key
        if key_filename is not None:
            rsa_key.write_private_key_file(key_filename)
        elif key_file_obj is not None:
            rsa_key.write_private_key(key_file_obj)
        else:
            raise ValueError('Neither key_filename nor key_file_obj is provided.')

        # ssh-rsa: key type
        # rsa_key.get_base64(): key phrase
        return "ssh-rsa " + rsa_key.get_base64() + " " + public_key_comment

    def save_keys(self, key_filename=None, key_file_obj=None, public_key_comment=''):
        """ Generate an RSA SSH key. Save the private key on the local machine, and save the public one on the remote.
        Must be called only when the client is connected.
        :param key_filename: path to which the private key should be saved
        :param key_file_obj: file object in which the private key should be saved
        :param public_key_comment: comment to be added at the end of the public key record
        :return: None
        """
        if key_filename is not None:
            # generate key pairs and save the private key on the local machine
            pub_key = Connection.ssh_keygen(key_filename=key_filename, public_key_comment=public_key_comment)
        elif key_file_obj is not None:
            # generate key pairs and save the private key in the key file object
            pub_key = Connection.ssh_keygen(key_file_obj=key_file_obj, public_key_comment=public_key_comment)
        else:
            raise ValueError('Neither key_filename nor key_file_obj is provided.')

        # save the public key onto the remote server
        exit_status, _, _, _ = self.exec_command_blocking(
            "mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo '%s' >>  ~/.ssh/authorized_keys" % pub_key)
        if exit_status != 0:
            return False, "Connection::save_keys: unable to save public key"

        return True, ""

    def exec_command_blocking(self, command):
        """ Execute some command on the remote and return the exit_status and the outputs of the execution.
        NOTE: This function is blocking.
        :param command: command to be executed
        :return: exit_status, stdin, stdout, stderr of the executed command
        """
        stdin, stdout, stderr = self.client.exec_command(command)
        exit_status = stdout.channel.recv_exit_status()

        return exit_status, stdin, stdout, stderr

    def _port_forward_thread(self, local_port, remote_port):
        forward_server = ForwardServer(("", local_port), Handler)

        forward_server.ssh_transport = self.client.get_transport()
        forward_server.chain_port = remote_port

        forward_server.serve_forever()
        forward_server.server_close()

    def port_forward(self, *args):
        forwarding_thread = threading.Thread(target=self._port_forward_thread, args=args)
        forwarding_thread.start()

    def is_eecg(self):
        return 'eecg' in self.host

    def is_ecf(self):
        return 'ecf' in self.host

    def is_uoft(self):
        return self.is_eecg() or self.is_ecf()
