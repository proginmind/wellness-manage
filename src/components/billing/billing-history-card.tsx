"use client";

import { format } from "date-fns";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";

import type { Invoice } from "@/types/billing";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BillingHistoryCardProps {
  invoices: Invoice[];
}

function formatStatus(status: Invoice["status"]): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusVariant(
  status: Invoice["status"]
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "paid") return "default";
  if (status === "open" || status === "draft") return "secondary";
  if (status === "uncollectible" || status === "void") return "destructive";
  return "outline";
}

function getStatusClassName(status: Invoice["status"]): string {
  if (status === "paid") return "bg-green-600 hover:bg-green-600 border-transparent";
  return "";
}

export function BillingHistoryCard({ invoices }: BillingHistoryCardProps) {
  const handleDownload = (invoice: Invoice) => {
    if (invoice.invoicePdf) {
      window.open(invoice.invoicePdf, "_blank");
    } else if (invoice.hostedInvoiceUrl) {
      window.open(invoice.hostedInvoiceUrl, "_blank");
    } else {
      toast.info("No receipt available", {
        description: "Receipt is not yet available for this payment.",
      });
    }
  };

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle>Billing history</CardTitle>
        <CardDescription>Invoices and receipts</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0 overflow-hidden">
        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-zinc-400 dark:text-zinc-500 mb-4" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No invoices yet</p>
          </div>
        ) : (
          <>
            {/* Mobile: card layout */}
            <div className="space-y-4 md:hidden">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {invoice.number ? `Invoice ${invoice.number}` : "Invoice"}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {format(new Date(invoice.created), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge
                      variant={getStatusVariant(invoice.status)}
                      className={cn("shrink-0", getStatusClassName(invoice.status))}
                    >
                      {formatStatus(invoice.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {formatCurrency(invoice.amountPaid, invoice.currency, { inCents: true })}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(invoice)}
                      title="Download PDF"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop: table */}
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="text-zinc-600 dark:text-zinc-400">
                        {format(new Date(invoice.created), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {invoice.number ? `Invoice ${invoice.number}` : "Invoice"}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(invoice.amountPaid, invoice.currency, { inCents: true })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusVariant(invoice.status)}
                          className={getStatusClassName(invoice.status)}
                        >
                          {formatStatus(invoice.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDownload(invoice)}
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
