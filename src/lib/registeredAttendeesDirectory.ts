import registeredAttendeesData from "./registeredAttendees.json";

export interface PreRegisteredAttendee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  institution: string;
  level: string;
  hasPaid: boolean;
}

const registeredList: PreRegisteredAttendee[] = registeredAttendeesData as PreRegisteredAttendee[];

/**
 * Search pre-registered attendees from the conference registration form.
 * Matches on name, email, or phone number.
 */
export function searchPreRegisteredAttendees(query: string): PreRegisteredAttendee[] {
  const clean = query.trim().toLowerCase();
  if (!clean || clean.length < 2) return [];

  const terms = clean.split(/\s+/).filter(Boolean);

  return registeredList.filter((att) => {
    const nameMatch = terms.every((t) => att.name.toLowerCase().includes(t));
    const emailMatch = att.email.toLowerCase().includes(clean);
    const phoneMatch = att.phone ? att.phone.replace(/\s+/g, "").includes(clean.replace(/\s+/g, "")) : false;
    const deptMatch = att.department.toLowerCase().includes(clean);

    return nameMatch || emailMatch || phoneMatch || deptMatch;
  });
}

/**
 * Find an exact attendee by email, phone, or ID.
 */
export function findPreRegisteredAttendee(query: string): PreRegisteredAttendee | undefined {
  const clean = query.trim().toLowerCase();
  if (!clean) return undefined;

  return registeredList.find(
    (att) =>
      att.id.toLowerCase() === clean ||
      att.email.toLowerCase() === clean ||
      (att.phone && att.phone.replace(/\s+/g, "") === clean.replace(/\s+/g, "")) ||
      att.name.toLowerCase() === clean
  );
}

export function getAllPreRegisteredAttendees(): PreRegisteredAttendee[] {
  return registeredList;
}
