export const HIGHER_ROLES = [
  'Product Leader',
  'Product Lead',
  'Admin',
  'Manager',
  'Product Manager',
  'Engineering Manager',
];

export const STANDARD_ROLES = [
  'Software Engineer',
  'UI/UX Designer',
  'QA Engineer',
  'Team Member',
];

export const isHigherRole = (role) => {
  if (!role) return false;
  const r = role.toLowerCase();
  return (
    r.includes('lead') ||
    r.includes('admin') ||
    r.includes('manager') ||
    r.includes('director') ||
    r.includes('executive') ||
    r.includes('head')
  );
};
