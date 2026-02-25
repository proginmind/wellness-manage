export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface OrganizationSocialLinks {
  website?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
}

export interface OrganizationContact {
  organizationId: string;
  phone?: string;
  email?: string;
  address?: OrganizationAddress;
  socialLinks?: OrganizationSocialLinks;
  createdAt: Date;
  updatedAt: Date;
}
