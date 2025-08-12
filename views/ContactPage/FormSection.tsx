/ views/ContactPage/FormSection.tsx
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import styled from 'styled-components';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { media } from '@/utils/media';
import MailSentState from '../../components/MailSentState';

interface EmailPayload {
  name: string;
  email: string;
  description: string;
}

export default function FormSection() {
  const [hasSuccessfullySentMail, setHasSuccessfullySentMail] = useState(false);
  const [hasErrored, setHasErrored] = useState(false);
  const { register, handleSubmit, formState } = useForm<EmailPayload>();
  const { isSubmitSuccessful, isSubmitting, isSubmitted, errors } = formState;

  const onSubmit: SubmitHandler<EmailPayload> = async (payload) => {
    try {
      // Create a properly formatted mailto link
      const subject = `Contact Form - ${payload.name}`;
      const body = `Name: ${payload.name}\nEmail: ${payload.email}\n\nMessage:\n${payload.description}`;
      
      const mailtoLink = `mailto:contactus@mekuva.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      // Open the user's default email client with the mailto link
      window.location.href = mailtoLink;
      
      // Email sent successfully
      setHasSuccessfullySentMail(true);
    } catch {
      // Error occurred
      setHasErrored(true);
    }
  };

  const isSent = isSubmitSuccessful && isSubmitted;
  const isDisabled = isSubmitting || isSent;
  const isSubmitDisabled = Object.keys(errors).length > 0 || isDisabled;

  if (hasSuccessfullySentMail) {
    return <MailSentState />;
  }

  return (
    <Wrapper>
      <FormTitle>Send us a Message</FormTitle>
      <Form onSubmit={handleSubmit(onSubmit)}>
        {hasErrored && <ErrorMessage>Couldn't send email. Please try again.</ErrorMessage>}
        <InputGroup>
          <InputStack>
            {errors.name && <ErrorMessage>Name is required</ErrorMessage>}
            <Input placeholder="Your Name" id="name" disabled={isDisabled} {...register('name', { required: true })} />
          </InputStack>
          <InputStack>
            {errors.email && <ErrorMessage>Email is required</ErrorMessage>}
            <Input 
              placeholder="Your Email" 
              id="email" 
              type="email"
              disabled={isDisabled} 
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Please enter a valid email address'
                }
              })} 
            />
          </InputStack>
        </InputGroup>
        <InputStack>
          {errors.description && <ErrorMessage>Message is required</ErrorMessage>}
          <Textarea
            as="textarea"
            placeholder="Enter Your Message..."
            id="description"
            disabled={isDisabled}
            {...register('description', { required: true })}
          />
        </InputStack>
        <Button as="button" type="submit" disabled={isSubmitDisabled}>
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </Button>
      </Form>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  flex: 2;
`;

const FormTitle = styled.h3`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: rgba(var(--text), 1);
`;

const Form = styled.form`
  & > * {
    margin-bottom: 2rem;
  }
`;

const InputGroup = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 2rem;

  & > * {
    flex: 1;
  }

  ${media('<=tablet')} {
    flex-direction: column;
    gap: 0;
    
    & > * {
      margin-bottom: 2rem;
    }
  }
`;

const InputStack = styled.div`
  display: flex;
  flex-direction: column;

  & > *:not(:first-child) {
    margin-top: 0.5rem;
  }
`;

const ErrorMessage = styled.p`
  color: rgb(var(--errorColor));
  font-size: 1.4rem;
  margin: 0;
  font-weight: 500;
`;

const Textarea = styled(Input)`
  width: 100%;
  min-height: 15rem;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
`;
