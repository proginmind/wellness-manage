import currencies from "@/data/currencies.json";
import { format } from "date-fns";

import { Organization, OrganizationContact } from "@/types/organization";
import { Profile } from "@/types/profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface OrganizationContentProps {
  organization: Organization;
  profile: Profile;
  contact?: OrganizationContact | null;
}

const SOCIAL_LABELS: Record<string, string> = {
  website: "Website",
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "Twitter / X",
  linkedin: "LinkedIn",
};

export function OrganizationContent({ organization, profile, contact }: OrganizationContentProps) {
  const currencyEntry = currencies.find((c) => c.code === (organization.currency ?? "USD"));
  const currencyLabel = currencyEntry
    ? `${currencyEntry.code} · ${currencyEntry.name} (${currencyEntry.symbol})`
    : (organization.currency ?? "USD");

  const address = contact?.address;
  const addressLines = address
    ? [
        address.line1,
        address.line2,
        [address.city, address.state, address.postalCode].filter(Boolean).join(", "),
        address.country,
      ].filter(Boolean)
    : [];

  const socialLinks = contact?.socialLinks
    ? Object.entries(contact.socialLinks).filter(([, url]) => !!url)
    : [];

  const hasContactInfo =
    contact &&
    (contact.phone || contact.email || addressLines.length > 0 || socialLinks.length > 0);

  return (
    <div className="space-y-6">
      {/* Organization Information */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Information</CardTitle>
          <CardDescription>Your organization details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Organization Name:</span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">{organization.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Currency:</span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">{currencyLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Your Role:</span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400 capitalize">
                {profile.role}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Organization ID:</span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400 font-mono">
                {organization.id.slice(0, 8)}...
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Created:</span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {format(new Date(organization.createdAt), "PPP")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      {hasContactInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Public contact details for your organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Phone & Email */}
            {(contact.phone || contact.email) && (
              <div className="space-y-2">
                {contact.phone && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Phone:</span>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {contact.phone}
                    </span>
                  </div>
                )}
                {contact.email && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Email:</span>
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline"
                    >
                      {contact.email}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Address */}
            {addressLines.length > 0 && (
              <>
                {(contact.phone || contact.email) && <Separator />}
                <div className="flex justify-between gap-4">
                  <span className="text-sm font-medium shrink-0">Address:</span>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400 text-right">
                    {addressLines.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <>
                {(contact.phone || contact.email || addressLines.length > 0) && <Separator />}
                <div className="space-y-2">
                  {socialLinks.map(([platform, url]) => (
                    <div key={platform} className="flex justify-between">
                      <span className="text-sm font-medium">
                        {SOCIAL_LABELS[platform] ?? platform}:
                      </span>
                      <a
                        href={url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline truncate max-w-[60%]"
                      >
                        {url as string}
                      </a>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
