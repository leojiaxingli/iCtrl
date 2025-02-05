import React from 'react';
import {
    Box, Button,
    LinearProgress,
    Stack,
    Step,
    StepContent,
    StepLabel,
    Stepper,
    TextField,
    Typography,
} from '@material-ui/core';

import {STEP_DONE} from '../../../actions/codes';
import {LoadingButton} from '@material-ui/lab';
import ChangeMachine from '../ChangeMachine';

function LinearProgressWithLabel(props) {
    return (
        <Box sx={{display: 'flex', alignItems: 'center'}}>
            <Box sx={{width: '100%', mr: 1}}>
                <LinearProgress variant="determinate" {...props} />
            </Box>
            <Box sx={{minWidth: 35}}>
                <Typography variant="body2" color="text.secondary">{`${Math.round(
                    props.value,
                )}%`}</Typography>
            </Box>
        </Box>
    );
}


export default class Loading extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            authInput: '',
            authHelperText: ' ',
            submitting: false,
            showChangeMachine: false
        };
    }

    handleAuthInputChange = (ev) => {
        const newAuthInput = ev.target.value;

        this.setState({
            authInput: newAuthInput,
            authHelperText: this.props.authentication.validator(newAuthInput),
        });
    };

    handleInputSubmit = (ev) => {
        this.setState({
            submitting: true,
        });
        this.props.authentication.submitter(this.state.authInput);
        ev.preventDefault();
    };

    handleNoLoadCheck = (_) =>{
        window.location = window.location.toString() + '?no_load_check'
    }

    handleShowChangeMachine = (_) =>{
        this.setState({
            showChangeMachine: true
        })
    }

    handleCloseChangeMachine = (_) =>{
        this.setState({
            showChangeMachine: false
        })
    }



    render() {
        const {currentStep, steps, authentication, isOverloaded, sessionId} = this.props;
        const {submitting, showChangeMachine} = this.state;
        const progressValue = (currentStep === -1) ? 0 :
            ((currentStep === STEP_DONE) ? 100 : currentStep / (steps.length - 1) * 100);
        return (<>
                <div style={{position: 'fixed', bottom: 0, width: '100vw'}}>
                    <Stepper style={{maxWidth: 480, margin: 'auto'}} activeStep={currentStep} orientation="vertical">
                        {steps.map((step, index) => (
                            <Step key={step.label}>
                                <StepLabel>
                                    <Typography variant={'h5'}>{step.label}</Typography>
                                </StepLabel>
                                <StepContent>
                                    <Typography color={'dimgrey'} variant={'body1'}>{step.description}</Typography>
                                    <br/>
                                </StepContent>
                                {Boolean(isOverloaded) && index === currentStep && <>
                                    <StepLabel error>
                                        <Typography variant={'h5'}>Someone else using the machine?</Typography>
                                    </StepLabel>
                                    <StepContent>
                                        <Typography color={'dimgrey'}
                                                    variant={'body2'}>
                                            There is more than one user using this machine,
                                            or the load on this machine is unusually high.
                                            If you are not reusing a session,
                                            please consider changing the target machine.
                                        </Typography>
                                        <br/>
                                        <Button onClick={this.handleNoLoadCheck}>
                                            Continue
                                        </Button>
                                        <Button onClick={this.handleShowChangeMachine}
                                            variant={'contained'} sx={{background: '#4caf50'}}>
                                            Change Machine
                                        </Button>
                                    </StepContent>
                                </>}
                                {Boolean(authentication) && index === currentStep && <>
                                    <StepLabel error>
                                        <Typography variant={'h5'}>{authentication.label}</Typography>
                                    </StepLabel>
                                    <StepContent>
                                        <Typography color={'dimgrey'}
                                                    variant={'body2'}>{authentication.description}</Typography>
                                        <br/>
                                        <form onSubmit={this.handleInputSubmit}>
                                            <Stack spacing={2} direction="row">
                                                <TextField
                                                    style={Boolean(authentication.validator) ? {} : {visibility: 'hidden'}}
                                                    disabled={submitting}
                                                    fullWidth
                                                    label="Password"
                                                    variant={'standard'}
                                                    id="auth-input"
                                                    value={this.state.authInput}
                                                    onChange={this.handleAuthInputChange}
                                                    type={'password'}
                                                    autoComplete={'new-password'}
                                                    helperText={this.state.authHelperText}
                                                    error={this.state.authHelperText !== ' '}
                                                />
                                                <LoadingButton
                                                    type={'submit'}
                                                    style={{width: 150, height: 36, alignSelf: 'center'}}
                                                    variant={'contained'}
                                                    loading={submitting}
                                                    disabled={Boolean(authentication.validator) &&
                                                    (this.state.authInput === '' ||
                                                        this.state.authHelperText !== ' ')}
                                                >
                                                    {authentication.submitterName}
                                                </LoadingButton>
                                            </Stack>
                                        </form>
                                </StepContent>
                                </>}
                            </Step>
                        ))}
                    </Stepper>
                    <br/><br/>
                    <LinearProgressWithLabel
                        variant="determinate"
                        color={Boolean(authentication) ? 'error' : 'primary'}
                        value={progressValue}/>
                </div>
                {showChangeMachine &&
                <ChangeMachine
                        session_id={sessionId}
                        domain={null}
                        onChangeMenuClose={this.handleCloseChangeMachine}/>}
            </>


        );
    }

}