import { useEffect, useState } from "react";
import {
  Mail,
  MessageCircle,
  PhoneCall,
  Smartphone,
  Send,
  Loader2,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Skeleton from "../../components/ui/Skeleton";
import StatusBadge from "../../components/ui/StatusBadge";
import { usePageLoading } from "../../hooks/usePageLoading";
import { communicationService } from "../../services/communicationService";
import { useToast } from "../../hooks/useToast";
import { formatDateTime } from "../../utils/formatters";

const channelIcons = {
  SMS: Smartphone,
  EMAIL: Mail,
  WHATSAPP: MessageCircle,
  VOICE: PhoneCall,
};

export default function CommunicationPage() {
  const loading = usePageLoading(350);
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [emailForm, setEmailForm] = useState({
    email: "",
    name: "",
    dueDate: "",
    amount: "",
  });
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const records = await communicationService.listMyCommunications();
        if (!cancelled) setItems(records);
      } catch (error) {
        if (!cancelled) {
          showToast(
            error?.response?.data?.message || "Unable to load communications.",
            "error",
          );
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (
      !emailForm.email ||
      !emailForm.name ||
      !emailForm.dueDate ||
      !emailForm.amount
    ) {
      showToast("Please fill all fields", "error");
      return;
    }
    setSendingEmail(true);
    try {
      const response = await fetch("http://localhost:8080/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailForm.email,
          name: emailForm.name,
          dueDate: emailForm.dueDate,
          amount: parseFloat(emailForm.amount),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        showToast("Email sent successfully!", "success");
        setEmailForm({ email: "", name: "", dueDate: "", amount: "" });
      } else {
        showToast(data.error || "Failed to send email", "error");
      }
    } catch (error) {
      showToast("Failed to send email: " + error.message, "error");
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-96" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Communication Timeline</h2>
        <p className="text-sm text-soft">
          End-to-end delivery visibility across SMS, Email, WhatsApp, and Voice.
        </p>
      </div>

      {/* Send Rent Reminder Email Form */}
      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-main flex items-center gap-2">
            <Mail size={20} />
            Send Rent Reminder Email
          </h3>
          <p className="text-sm text-soft">
            Send a friendly rent reminder to tenants
          </p>
        </div>
        <form onSubmit={handleSendEmail} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-main mb-1">
                Recipient Email
              </label>
              <input
                type="email"
                value={emailForm.email}
                onChange={(e) =>
                  setEmailForm({ ...emailForm, email: e.target.value })
                }
                placeholder="tenant@example.com"
                className="w-full px-3 py-2 border border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-main bg-white text-main"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-main mb-1">
                Tenant Name
              </label>
              <input
                type="text"
                value={emailForm.name}
                onChange={(e) =>
                  setEmailForm({ ...emailForm, name: e.target.value })
                }
                placeholder="John Doe"
                className="w-full px-3 py-2 border border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-main bg-white text-main"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-main mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={emailForm.dueDate}
                onChange={(e) =>
                  setEmailForm({ ...emailForm, dueDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-main bg-white text-main"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-main mb-1">
                Rent Amount (₹)
              </label>
              <input
                type="number"
                value={emailForm.amount}
                onChange={(e) =>
                  setEmailForm({ ...emailForm, amount: e.target.value })
                }
                placeholder="10000"
                className="w-full px-3 py-2 border border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-main bg-white text-main"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={sendingEmail}
            className="
    flex items-center justify-center gap-2
    px-5 py-3
    rounded-xl
    font-semibold
    text-white
    bg-gradient-to-r from-teal-500 to-cyan-500
    shadow-lg shadow-teal-500/30
    transition-all duration-200 ease-out
    hover:from-teal-600 hover:to-cyan-600
    hover:shadow-xl hover:scale-[1.02]
    active:scale-95
    focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2
    disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100
  "
          >
            {sendingEmail ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
            {sendingEmail ? "Sending..." : "Send Reminder Email"}
          </button>
        </form>
      </Card>

      {/* Communication Timeline */}
      <Card>
        <div className="space-y-3">
          {items.map((item) => {
            const Icon = channelIcons[item.channel] || MessageCircle;
            return (
              <div key={item.id} className="rounded-xl border border-base p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface-soft text-main">
                      <Icon size={15} />
                    </span>
                    <strong className="text-sm text-main">
                      {item.channel}
                    </strong>
                    <span className="rounded-lg bg-surface-soft px-2 py-1 text-xs font-semibold text-main">
                      {item.templateName}
                    </span>
                  </div>
                  <StatusBadge status={item.deliveryStatus} />
                </div>
                <p className="mt-2 text-sm text-soft">{item.message}</p>
                <p className="mt-1 text-xs text-soft">
                  {formatDateTime(item.timestamp)}
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
