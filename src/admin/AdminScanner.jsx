import React, { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { verifyTicketAttendanceAPI } from "../services/allAPI";

export default function AdminScanner() {
  const scannerRef = useRef(null);

  useEffect(() => {
    // Only build the scanner instance once on component mount
    if (scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      (decodedText) => {
        console.log("Scanned UUID:", decodedText);

        // Send the raw UUID string directly to the validation API
        verifyTicketAttendanceAPI(decodedText)
          .then((res) => {
            alert(`✅ ${res?.data?.message || "Access Granted!"}`);
          })
          .catch((err) => {
            console.error(err);
            alert(`❌ ${err?.response?.data?.message || "Invalid or Used Ticket!"}`);
          });
      },
      (error) => {
        // Suppress continuous passive scanning console noise
      }
    );

    scannerRef.current = scanner;

    // Cleanup: shut off camera feed when leaving the admin route page
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => console.error(err));
        scannerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-bg text-text flex items-center justify-center p-6 pt-24">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 shadow-xl">
        
        {/* HEADER BRANDING */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">QR Ticket Scanner</h1>
          <p className="text-xs text-muted mt-1">Scan gate passes to instantly verify guest entry UUID tokens.</p>
        </div>

        {/* WEB CAMERA TARGET CAMERA CANVAS VIEWPORT */}
        <div className="rounded-xl overflow-hidden border border-border bg-black">
          <div id="reader" className="w-full" />
        </div>

      </div>
    </div>
  );
}