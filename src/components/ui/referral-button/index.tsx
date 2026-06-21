"use client";

import { Send, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useMyReferralRequest, useRequestReferral } from "@/hooks/use-jobs";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface ReferralButtonProps {
    jobId: string;
    referralAvailable: boolean;
    /** Extra classes for sizing/padding/layout — component owns color and shape */
    className?: string;
    iconSize?: number;
}

export function ReferralButton({ jobId, referralAvailable, className, iconSize = 14 }: ReferralButtonProps) {
    const { referralRequest, isLoading: statusLoading, mutate } = useMyReferralRequest(referralAvailable ? jobId : null);
    const { trigger, isLoading: submitting } = useRequestReferral(jobId);
    const { toast } = useToast();

    const handleClick = async () => {
        try {
            await trigger({});
            await mutate();
            toast("Referral request sent", "success");
        } catch {
            toast("Could not request referral", "error");
        }
    };

    const base = "flex items-center justify-center gap-1.5 font-bold transition-colors border disabled:cursor-not-allowed";

    if (!referralAvailable) {
        return (
            <button disabled className={cn(base, "bg-stone-50 text-stone-300 border-stone-200", className)}>
                <Send size={iconSize} /> Seek referral
            </button>
        );
    }

    if (statusLoading) {
        return (
            <button disabled className={cn(base, "bg-stone-50 text-stone-400 border-stone-200", className)}>
                <Loader2 size={iconSize} className="animate-spin" /> Loading…
            </button>
        );
    }

    const status = referralRequest?.status;

    if (status === "PENDING") {
        return (
            <button disabled className={cn(base, "bg-brand-50 text-brand-700 border-brand-200 cursor-default", className)}>
                <Send size={iconSize} /> Referral requested
            </button>
        );
    }

    if (status === "FULFILLED") {
        return (
            <button disabled className={cn(base, "bg-green-50 text-green-700 border-green-200", className)}>
                <CheckCircle size={iconSize} /> Referral fulfilled
            </button>
        );
    }

    if (status === "DECLINED") {
        return (
            <button disabled className={cn(base, "bg-red-50 text-red-700 border-red-200", className)}>
                <XCircle size={iconSize} /> Referral declined
            </button>
        );
    }

    return (
        <button
            onClick={() => void handleClick()}
            disabled={submitting}
            className={cn(base, "bg-white text-brand-700 border-brand-200 hover:bg-brand-50 disabled:opacity-70", className)}
        >
            {submitting ? <Loader2 size={iconSize} className="animate-spin" /> : <Send size={iconSize} />}
            Seek referral
        </button>
    );
}
