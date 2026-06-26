import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "npm:@react-email/components@0.0.22";
import * as React from "npm:react@18.3.1";

export interface VisitCancelledStaffProps {
  staffName: string;
  memberName: string;
  serviceName: string;
  date: string;
  time: string;
  durationMinutes?: number;
  notes?: string;
  orgName?: string;
  orgPhone?: string;
  orgEmail?: string;
  orgWebsite?: string;
  orgAddress?: string;
}

export const VisitCancelledStaff = ({
  staffName,
  memberName,
  serviceName,
  date,
  time,
  durationMinutes,
  notes,
  orgName,
  orgPhone,
  orgEmail,
  orgWebsite,
  orgAddress,
}: VisitCancelledStaffProps) => (
  <Html>
    <Head />
    <Preview>Appointment cancelled</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Appointment cancelled</Heading>
        <Text style={text}>Hi {staffName},</Text>
        <Text style={text}>The following appointment assigned to you has been cancelled:</Text>
        <Section style={detailsBox}>
          <Text style={label}>Client</Text>
          <Text style={value}>{memberName}</Text>
          <Text style={label}>Service</Text>
          <Text style={value}>{serviceName}</Text>
          {durationMinutes != null && (
            <>
              <Text style={label}>Duration</Text>
              <Text style={value}>{durationMinutes} minutes</Text>
            </>
          )}
          <Text style={label}>Date</Text>
          <Text style={value}>{date}</Text>
          <Text style={label}>Time</Text>
          <Text style={value}>{time}</Text>
          {notes && (
            <>
              <Text style={label}>Notes</Text>
              <Text style={value}>{notes}</Text>
            </>
          )}
        </Section>
        <Hr style={hr} />
        {(orgName || orgPhone || orgEmail || orgWebsite || orgAddress) && (
          <Text style={footer}>
            {orgName && <strong>{orgName}</strong>}
            {orgPhone && <> &middot; {orgPhone}</>}
            {orgEmail && (
              <>
                {" "}
                &middot;{" "}
                <Link href={`mailto:${orgEmail}`} style={footerLink}>
                  {orgEmail}
                </Link>
              </>
            )}
            {orgWebsite && (
              <>
                {" "}
                &middot;{" "}
                <Link href={orgWebsite} style={footerLink}>
                  {orgWebsite}
                </Link>
              </>
            )}
            {orgAddress && (
              <>
                <br />
                {orgAddress}
              </>
            )}
          </Text>
        )}
      </Container>
    </Body>
  </Html>
);

export default VisitCancelledStaff;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "24px",
  maxWidth: "560px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold" as const,
  margin: "32px 0 24px",
  padding: "0",
};

const text = {
  color: "#333",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "16px 0",
};

const detailsBox = {
  backgroundColor: "#f8fafc",
  borderRadius: "6px",
  padding: "16px",
  margin: "24px 0",
};

const label = {
  color: "#64748b",
  fontSize: "12px",
  fontWeight: "600" as const,
  margin: "8px 0 2px",
  textTransform: "uppercase" as const,
};

const value = {
  color: "#333",
  fontSize: "14px",
  margin: "0 0 12px",
};

const hr = {
  borderColor: "#e2e8f0",
  margin: "24px 0",
};

const footer = {
  color: "#64748b",
  fontSize: "12px",
  lineHeight: "20px",
  marginTop: "12px",
  marginBottom: "24px",
};

const footerLink = {
  color: "#64748b",
  textDecoration: "underline",
};
