import axios from 'axios';
import {htmlResponseToReason} from './utils';

export const sftp_ls = (fm, path) => {
    fm.setState({
        loading: true,
        alertMsg: null,
        alertOpen: false,
    });
    axios.get(`/api/sftp_ls/${fm.session_id}`, {
        params: {
            path: path,
        },
    }).then(response => {
        fm.files = response.data.files;
        fm.setState({
            cwd: response.data.cwd,
            cwdInput: response.data.cwd,
            filesDisplaying: fm.showHidden ? fm.files : fm.nonHiddenFiles(),
            loading: false,
        });
    }).catch(error => {
        if (error.response) {
            fm.showAlert(htmlResponseToReason(error.response.data));
        } else {
            // Something happened in setting up the request that triggered an Error
            fm.showAlert('Error: ' + error.message);
        }
    });
};

export const sftp_dl = (session_id, cwd, files) => {
    const a = document.createElement('a');
    a.download = '';
    a.href = `/api/sftp_dl/${session_id}?` +
        `cwd=${cwd}&` +
        `files=${JSON.stringify(files)}`;
    a.click();
};

export const sftp_ul = (fm, session_id, cwd, file, isDirectory) => {
    const uploadProgressIdx = fm.state.uploadProgress.length;
    const cancelTokenSrc = axios.CancelToken.source();
    fm.setState({
        uploadProgress: [...fm.state.uploadProgress, {
            filename: file.name,
            progress: 0,
            speed: 0,
            loaded: 0,
            totalSize: file.size,
            cancelTokenSrc: cancelTokenSrc,
            cancelled: false,
        }],
    });
    const startTime = new Date().getTime();
    axios.post(
        `/api/sftp_ul/${session_id}`,
        file,
        {
            cancelToken: cancelTokenSrc.token,
            headers: {
                Cwd: cwd,
                Path: isDirectory ? (file.webkitRelativePath) : (file.name),
            },
            onUploadProgress: progressEvent => {
                const percentage = Math.floor(progressEvent.loaded * 100 / progressEvent.total);

                // the time is in milliseconds
                const speed = progressEvent.loaded *
                    1000 / (new Date().getTime() - startTime);

                fm.setState(({uploadProgress}) => ({
                    uploadProgress: [
                        ...uploadProgress.slice(0, uploadProgressIdx),
                        {
                            ...uploadProgress[uploadProgressIdx],
                            progress: percentage,
                            speed: speed,
                            loaded: progressEvent.loaded,
                        },
                        ...uploadProgress.slice(uploadProgressIdx + 1),
                    ],
                }));
            },
        }).then(_ => {
        fm.loadDir(fm.state.cwd);
    }).catch(error => {
        if (error.response) {
            fm.showAlert(htmlResponseToReason(error.response.data));
        } else {
            // Something happened in setting up the request that triggered an Error
            fm.showAlert('Error: ' + error.message);
        }
    });
};

export const sftp_rename = (fm, session_id, cwd, old_name, new_name) => {
    axios.patch(`/api/sftp_rename/${session_id}`, {
        cwd: cwd,
        old: old_name,
        new: new_name,
    }).then(_ => {
        fm.loadDir(fm.state.cwd);
    }).catch(error => {
        console.log(error);
    });
};

export const sftp_rm = (fm, session_id, cwd, files) => {
    axios.post(`/api/sftp_rm/${session_id}`,
        {
            cwd: cwd,
            files: files,
        }).then(_ => {
        fm.loadDir(fm.state.cwd);
    }).catch(error => {
        fm.loadDir(fm.state.cwd);
        if (error.response) {
            fm.showAlert(htmlResponseToReason(error.response.data));
        } else {
            // Something happened in setting up the request that triggered an Error
            fm.showAlert('Error: ' + error.message);
        }
    });
};

export const sftp_chmod = (fm, cwd, name, mode, recursive) => {
    fm.setState({
        loading: true,
    });
    axios.patch(`/api/sftp_chmod/${fm.session_id}`, {
        path: `${cwd}/${name}`,
        mode: mode,
        recursive: recursive,
    }).then(_ => {
        fm.loadDir(cwd);
    }).catch(error => {
        fm.loadDir(cwd);
        if (error.response) {
            fm.showAlert(htmlResponseToReason(error.response.data));
        } else {
            // Something happened in setting up the request that triggered an Error
            fm.showAlert('Error: ' + error.message);
        }
    });
};

export const sftp_quota = (fm, ms) => {
    // load silently as much as possible
    // because not all machines support quota checking
    axios.post('/api/exec_blocking', {
        session_id: fm.session_id,
        cmd: 'quota -s | tail -n 1',
    }).then(res => {
        const mem = res.data.match(/[0-9]+[a-zA-Z]+/g);
        ms.setState({
            used: parseInt(mem[0]),
            usedUnit: mem[0].replace(/[0-9]+/, ''),
            quota: parseInt(mem[1]),
            quotaUnit: mem[1].replace(/[0-9]+/, ''),
        });
    }).catch(error => {
        // handle this silently because not all machines support quota checking
        ms.setState({quota: null});
    });
};

