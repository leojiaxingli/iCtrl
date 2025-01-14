import copy
import json
import uuid

from application.paths import *

_PROFILE_VERSION = 1  # in case the schema changes in the future

_EMPTY_SESSION = {
    "host": "",
    "username": ""
}

_EMPTY_USER_PROFILE = {
    "version": _PROFILE_VERSION,
    "sessions": {},
}


class LocalProfile:
    def __init__(self):
        self._profile = copy.deepcopy(_EMPTY_USER_PROFILE)
        try:
            with open(USER_PROFILE_PATH, "r") as infile:
                json_data = json.load(infile)

                if "version" not in json_data or json_data["version"] != _PROFILE_VERSION:
                    raise ValueError("LocalProfile: Version info not found or mismatch in the profile.")

                # TODO: make sure the sessions file is not modified in an attempt to crash the script
                self._profile["sessions"] = json_data["sessions"]
                self._profile["last_session"] = json_data["last_session"]

        except Exception as e:
            self._profile = copy.deepcopy(_EMPTY_USER_PROFILE)
            print("LocalProfile: load_profile:", e)
            # raise e
            print("Unable to load the user profile. Using the default profile instead.")

    def query(self):
        return self._profile

    def add_session(self, host, username, conn=None):
        session = copy.deepcopy(_EMPTY_SESSION)

        session_id = uuid.uuid4().hex
        self._profile["sessions"][session_id] = session
        session["host"] = host
        session["username"] = username

        if conn is not None:
            this_private_key_path = os.path.join(PRIVATE_KEY_PATH, session_id)
            status, reason = conn.save_keys(key_filename=this_private_key_path,
                                            public_key_comment=this_private_key_path)
            if not status:
                return status, reason

        self.save_profile()

        return True, ''

    def delete_session(self, session_id):
        if session_id not in self._profile['sessions']:
            return False, f'failed: session {session_id} does not exist'

        try:
            os.remove(os.path.join(PRIVATE_KEY_PATH, session_id))
        except FileNotFoundError:
            print('Not valid SSH key found for deletion')

        self._profile['sessions'].pop(session_id)
        self.save_profile()

        return True, ''

    def change_host(self, session_id, new_host):
        if session_id not in self._profile['sessions']:
            return False, f'failed: session {session_id} does not exist'

        self._profile["sessions"][session_id]['host'] = new_host
        self.save_profile()

        return True, ''

    def save_profile(self):
        try:
            with open(USER_PROFILE_PATH, 'w') as outfile:
                json_data = json.dumps(self._profile, indent=4)
                outfile.write(json_data)
        except Exception as e:
            # need to handle any write permission issues, once observed
            raise e

    def get_session_info(self, session_id):
        if session_id not in self._profile['sessions']:
            return None, None, None

        host = self._profile['sessions'][session_id]['host']
        username = self._profile['sessions'][session_id]['username']
        this_private_key_path = os.path.join(PRIVATE_KEY_PATH, session_id)

        return host, username, this_private_key_path, None
