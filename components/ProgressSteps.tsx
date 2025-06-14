import React from 'react';
import styled from 'styled-components';

const steps = [
    {
        label: 'Order Confirmed',
        step: 1,
    },
    {
        label: 'Printing Scheduled',
        step: 2,
    },
    {
        label: 'In Production',
        step: 3,
    },
    {
        label: 'Post Processing',
        step: 4,
    },
    {
        label: 'Dispatch',
        step: 5,
    }
]

const ProgressSteps = ({ currentStep = 3 }) => {
    const progressWidth = `calc((100% - 130px) / ${steps.length - 1} * ${currentStep - 1})`;
    const progressHeight = `calc((100% - 70px) / ${steps.length - 1} * ${currentStep - 1})`;

    return (
        <MainContainer>
            <StepContainer>
                <ProgressBackground />
                <ProgressForeground progressWidth={progressWidth} progressHeight={progressHeight} />
                {steps.map(({ step, label }) => (
                    <StepWrapper key={step}>
                        <StepStyle isCompleted={step <= currentStep}>
                            {step <= currentStep ? <CheckMark>&#10003;</CheckMark> : <StepCount>{step}</StepCount>}
                        </StepStyle>
                        <StepsLabelContainer>
                            <StepLabel>{label}</StepLabel>
                        </StepsLabelContainer>
                    </StepWrapper>
                ))}
            </StepContainer>
        </MainContainer>
    )
}

const MainContainer = styled.div`
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 0 15px;
`

const StepContainer = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 70px;
    position: relative;

    @media (max-width: 600px) {
        flex-direction: column;
        align-items: flex-start;
    }
`

const ProgressBackground = styled.div`
    content: '';
    position: absolute;
    background-color: #e6e7e8;
    height: 3px;
    width: calc(100% - 130px);
    top: 30%;
    transform: translateY(-50%);
    left: 70px;

    @media (max-width: 600px) {
        width: 2px;
        height: calc(100% - 40px);
        top: 20px;
        left: 20px;
        transform: translateX(-50%);
    }
`

const ProgressForeground = styled.div<{ progressWidth: string, progressHeight: string }>`
    content: '';
    position: absolute;
    background-color: #0a121e;
    height: 3px;
    width: ${({ progressWidth }) => progressWidth};
    top: 30%;
    transition: 0.4s ease;
    transform: translateY(-50%);
    left: 70px;

    @media (max-width: 600px) {
        width: 2px;
        height: ${({ progressHeight }) => progressHeight};
        top: 40px;
        left: 20px;
        transform: translateX(-50%);
    }
`

const StepWrapper = styled.div`
    position: relative;
    z-index: 1;
    text-align: center;
    flex: 1;

    @media (max-width: 600px) {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
    }
`

const StepStyle = styled.div<{ isCompleted: boolean }>`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: ${({ isCompleted }) => (isCompleted ? '#0a121e' : '#e6e7e8')};
    transition: 0.4s ease;
    //border: 3px solid #fed700;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    margin: 0 auto;

    @media (max-width: 600px) {
        margin: 0;
    }
`

const CheckMark = styled.span`
    font-size: 18px;
    color: #fff;
`

const StepCount = styled.span`
    font-size: 15px;
    color: #fff;
`

const StepsLabelContainer = styled.div`
    margin-top: 10px;

    @media (max-width: 600px) {
        margin-top: 0;
        margin-left: 20px;
        text-align: left;
    }
`

const StepLabel = styled.span`
    font-size: 15px;
    color: #0a121e;
`

export default ProgressSteps;
