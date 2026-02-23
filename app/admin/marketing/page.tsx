"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import MarketingDashboard from "@/components/admin/MarketingDashboard";

export default function MarketingAdminPage() {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedKey = localStorage.getItem('admin_access_key');
        if (storedKey) {
            fetch('/api/admin/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: storedKey })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.valid) {
                        setIsAuthorized(true);
                    } else {
                        localStorage.removeItem('admin_access_key');
                        router.push('/admin');
                    }
                })
                .catch(() => {
                    localStorage.removeItem('admin_access_key');
                    router.push('/admin');
                })
                .finally(() => setLoading(false));
        } else {
            router.push('/admin');
        }
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-navy flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthorized) {
        return null; // Will redirect via useEffect
    }

    return (
        <div className="min-h-screen bg-navy text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-white/10 pb-6">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <Link href="/admin" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-white/40 hover:text-white">
                                <ArrowLeft size={24} />
                            </Link>
                            <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter">Sales & Marketing Hub</h1>
                        </div>
                        <p className="text-primary text-[10px] font-black uppercase tracking-widest mt-1 ml-14">Centro de Entrenamiento y Activos Comerciales</p>
                    </div>
                </header>

                {/* Dashboard Component loaded here */}
                <MarketingDashboard />
            </div>
        </div>
    );
}
