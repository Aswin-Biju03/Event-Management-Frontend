import React, { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { verifyTicketAttendanceAPI } from "../services/allAPI";

export default function AdminScanner() {
  const scannerRef = useRef(null);
  const hasScanned = useRef(false); // ✅ prevents duplicate scans

  useEffect(() => {
    if (scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      (decodedText) => {
        if (hasScanned.current) return;
        hasScanned.current = true;

        scanner.pause();

        verifyTicketAttendanceAPI(decodedText)
          .then((res) => {
            alert(`✅ ${res?.data?.message || "Access Granted!"}`);
          })
          .catch((err) => {
            alert(`❌ ${err?.response?.data?.message || "Invalid or Used Ticket!"}`);
          })
          .finally(() => {
            hasScanned.current = false;
            scanner.resume();
          });
      },
      () => {}
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-bg text-text flex items-center justify-center p-6 pt-24">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 shadow-xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">QR Ticket Scanner</h1>
          <p className="text-xs text-muted mt-1">Scan gate passes to instantly verify guest entry UUID tokens.</p>
        </div>
        <div className="rounded-xl overflow-hidden border border-border bg-black">
          <div id="reader" className="w-full" />
        </div>
      </div>
    </div>
  );
}