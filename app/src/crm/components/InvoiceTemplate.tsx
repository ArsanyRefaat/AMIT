import { Phone, Mail, MapPin, Globe } from 'lucide-react';
import type { Invoice } from '@/types';

interface InvoiceTemplateProps {
  invoice: Invoice;
}

export function InvoiceTemplate({ invoice }: InvoiceTemplateProps) {
  return (
    <div className="bg-white p-8 lg:p-12 max-w-4xl mx-auto print:p-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-12">
        <div>
          <img
            src="/images/amt-logo.png"
            alt="AMT Solutions"
            className="h-16 w-auto mb-4"
          />
          <div className="space-y-1 text-sm text-[var(--amd-gray-600)]">
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              123 Nile Corniche, Suite 500, Cairo, Egypt
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              +20 100 123 4567
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              hello@amtsolutions.com
            </p>
            <p className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              www.amtsolutions.com
            </p>
          </div>
        </div>
        <div className="text-left lg:text-right">
          <h1 className="font-heading text-4xl font-bold text-[var(--amd-black)] mb-2">INVOICE</h1>
          <p className="text-2xl font-semibold text-[var(--amd-gold)]">{invoice.invoiceNumber}</p>
          <div className="mt-4 space-y-1 text-sm">
            <p>
              <span className="text-[var(--amd-gray-500)]">Issue Date:</span>{' '}
              <span className="font-medium">{new Date(invoice.issueDate).toLocaleDateString()}</span>
            </p>
            <p>
              <span className="text-[var(--amd-gray-500)]">Due Date:</span>{' '}
              <span className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</span>
            </p>
            <p>
              <span className="text-[var(--amd-gray-500)]">Status:</span>{' '}
              <span
                className={`font-medium capitalize ${
                  invoice.status === 'paid'
                    ? 'text-green-600'
                    : invoice.status === 'overdue'
                    ? 'text-red-600'
                    : 'text-amber-600'
                }`}
              >
                {invoice.status}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-12">
        <h2 className="text-sm font-semibold text-[var(--amd-gray-500)] uppercase tracking-wider mb-3">
          Bill To
        </h2>
        <div className="bg-[var(--amd-gray-50)] rounded-lg p-6">
          <h3 className="font-heading text-xl font-semibold text-[var(--amd-black)] mb-2">
            {invoice.customer.name}
          </h3>
          <div className="space-y-1 text-sm text-[var(--amd-gray-600)]">
            {invoice.customer.address && (
              <p>
                {invoice.customer.address.street}
                <br />
                {invoice.customer.address.city}, {invoice.customer.address.country}
              </p>
            )}
            <p>{invoice.customer.email}</p>
            {invoice.customer.phone && <p>{invoice.customer.phone}</p>}
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="mb-12">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-[var(--amd-black)]">
              <th className="text-left py-3 text-sm font-semibold text-[var(--amd-gray-700)]">Description</th>
              <th className="text-center py-3 text-sm font-semibold text-[var(--amd-gray-700)]">Qty</th>
              <th className="text-right py-3 text-sm font-semibold text-[var(--amd-gray-700)]">Unit Price</th>
              <th className="text-right py-3 text-sm font-semibold text-[var(--amd-gray-700)]">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((item) => (
              <tr key={item.id} className="border-b border-[var(--amd-gray-200)]">
                <td className="py-4 text-[var(--amd-black)]">{item.description}</td>
                <td className="py-4 text-center text-[var(--amd-gray-600)]">{item.quantity}</td>
                <td className="py-4 text-right text-[var(--amd-gray-600)]">
                  EGP {item.unitPrice.toLocaleString()}
                </td>
                <td className="py-4 text-right font-medium text-[var(--amd-black)]">
                  EGP {item.total.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-12">
        <div className="w-full lg:w-1/2">
          <div className="space-y-2">
            <div className="flex justify-between py-2">
              <span className="text-[var(--amd-gray-600)]">Subtotal</span>
              <span className="font-medium">EGP {invoice.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[var(--amd-gray-600)]">Tax ({invoice.taxRate}%)</span>
              <span className="font-medium">EGP {invoice.taxAmount.toLocaleString()}</span>
            </div>
            {invoice.discount && invoice.discount > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-[var(--amd-gray-600)]">Discount</span>
                <span className="font-medium text-green-600">- EGP {invoice.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between py-3 border-t-2 border-[var(--amd-black)]">
              <span className="font-heading text-lg font-semibold">Total</span>
              <span className="font-heading text-lg font-bold text-[var(--amd-gold)]">
                EGP {invoice.total.toLocaleString()}
              </span>
            </div>
            {invoice.amountPaid > 0 && (
              <>
                <div className="flex justify-between py-2">
                  <span className="text-[var(--amd-gray-600)]">Amount Paid</span>
                  <span className="font-medium text-green-600">
                    EGP {invoice.amountPaid.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold">Balance Due</span>
                  <span className="font-bold text-red-600">EGP {invoice.balanceDue.toLocaleString()}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      {(invoice.notes || invoice.terms || invoice.paymentInstructions) && (
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {invoice.notes && (
            <div>
              <h3 className="text-sm font-semibold text-[var(--amd-gray-500)] uppercase tracking-wider mb-2">
                Notes
              </h3>
              <p className="text-sm text-[var(--amd-gray-600)]">{invoice.notes}</p>
            </div>
          )}
          {invoice.paymentInstructions && (
            <div>
              <h3 className="text-sm font-semibold text-[var(--amd-gray-500)] uppercase tracking-wider mb-2">
                Payment Instructions
              </h3>
              <p className="text-sm text-[var(--amd-gray-600)]">{invoice.paymentInstructions}</p>
            </div>
          )}
        </div>
      )}

      {/* Terms */}
      {invoice.terms && (
        <div className="mb-12">
          <h3 className="text-sm font-semibold text-[var(--amd-gray-500)] uppercase tracking-wider mb-2">
            Terms & Conditions
          </h3>
          <p className="text-sm text-[var(--amd-gray-600)]">{invoice.terms}</p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-[var(--amd-gray-200)] pt-8 text-center">
        <p className="text-sm text-[var(--amd-gray-500)]">
          Thank you for your business! If you have any questions about this invoice, please contact us at{' '}
          <a href="mailto:hello@amtsolutions.com" className="text-[var(--amd-gold)]">
            hello@amtsolutions.com
          </a>
        </p>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
