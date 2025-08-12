

export default function InformationSection() {
  return (
    <Wrapper>
      <h3>Contact Info</h3>
      <ContactDetails>
        <ContactItem>
          <Label>Email:</Label> contactus@mekuva.com
        </ContactItem>
        <ContactItem>
          <Label>Phone:</Label> (+91) 8686700666
        </ContactItem>
        <ContactItem>
          <Label>Address:</Label> Your Business Address Here
        </ContactItem>
      </ContactDetails>
      
      <BusinessHours>
        <h4>Business Hours</h4>
        <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
        <p>Saturday: 10:00 AM - 4:00 PM</p>
        <p>Sunday: Closed</p>
      </BusinessHours>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  flex: 1;
  margin-right: 3rem;
  margin-bottom: 3rem;
  
  ${media('<=tablet')} {
    margin-right: 0;
    margin-bottom: 2rem;
  }
  
  h3 {
    font-size: 2.5rem;
    margin-bottom: 2rem;
    color: rgba(var(--text), 1);
  }
  
  h4 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: rgba(var(--text), 1);
  }
`;

const ContactDetails = styled.div`
  margin-bottom: 3rem;
`;

const ContactItem = styled.p`
  font-weight: normal;
  font-size: 1.6rem;
  color: rgba(var(--text), 0.7);
  margin-bottom: 1.5rem;
  line-height: 1.4;
`;

const Label = styled.span`
  opacity: 1;
  color: rgba(var(--text), 1);
  font-weight: 600;
`;

const BusinessHours = styled.div`
  padding: 2rem;
  background: rgba(var(--text), 0.05);
  border-radius: 8px;
  border-left: 4px solid var(--primary);
  
  p {
    font-size: 1.4rem;
    color: rgba(var(--text), 0.8);
    margin: 0.5rem 0;
  }
`;
