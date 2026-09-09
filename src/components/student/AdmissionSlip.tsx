"use client";

import Image from "next/image";
import QRCode from "react-qr-code";

interface AdmissionSlipProps {
  student: any;
}

export default function AdmissionSlip({
  student,
}: AdmissionSlipProps) {
  return (
    <div className="max-w-5xl mx-auto bg-white p-10 print:p-4">

      {/* Header */}

      <div className="flex justify-between items-center border-b pb-6">

        <div className="w-24 flex justify-start">
  <Image
    src="/logo.svg"
    alt="Rubix School"
    width={90}
    height={90}
    priority
  />
</div>

        <div className="text-center flex-1">
          <h1 className="text-3xl font-bold">
            {student.school.name}
          </h1>

          <p className="text-gray-500">
            Official Admission Slip
          </p>

          <p className="text-sm text-gray-400">
            {student.school.address}
          </p>

          <p className="text-sm text-gray-400">
            {student.school.phone}
          </p>
        </div>

        <div className="w-24 flex justify-end">
          {student.img ? (
            <Image
              src={student.img}
              alt={student.name}
              width={100}
              height={120}
              className="rounded border object-cover"
              unoptimized
            />
          ) : (
            <div className="w-[100px] h-[120px] border rounded flex items-center justify-center text-xs">
              No Photo
            </div>
          )}
        </div>

      </div>

      {/* Body */}

      <div className="grid grid-cols-2 gap-6 mt-10">

        <Field
          title="Admission Number"
          value={student.admissionNumber}
        />

        <Field
          title="Application Number"
          value={student.admission?.applicationNumber ?? "-"}
        />

        <Field
          title="Admission Date"
          value={
            student.admission?.reviewedAt
              ? new Date(student.admission.reviewedAt).toLocaleDateString("en-GB")
              : "-"
          }
        />

        <Field
          title="Registration ID"
          value={student.username ?? student.id}
        />

        <Field
          title="Full Name"
          value={`${student.name} ${student.surname}`}
        />

        <Field
          title="Gender"
          value={student.sex}
        />

        <Field
          title="Date of Birth"
          value={new Date(student.birthday).toLocaleDateString("en-GB")}
        />

        <Field
          title="Level"
          value={student.level?.name}
        />

        <Field
          title="Class"
          value={student.class?.name ?? "Not Assigned"}
        />

        <Field
          title="Phone"
          value={student.phone ?? "-"}
        />

        <Field
          title="Email"
          value={student.email ?? "-"}
        />

        <Field
          title="Address"
          value={student.address}
        />

      </div>

      <div className="mt-12 border-t pt-8">
  <div className="grid grid-cols-3 gap-10 items-end">

    {/* Admission Note */}
    <div className="col-span-2">
      <p className="text-sm text-gray-700 leading-7">
        Congratulations! You have been offered provisional admission into{" "}
        <strong>{student.school.name}</strong>.
      </p>

      <p className="mt-3 text-sm text-gray-600">
        Please present this admission slip during registration.
      </p>

      <p className="mt-6 text-xs text-gray-500">
        This document is electronically generated and can be verified using
        the QR Code.
      </p>
    </div>

    {/* QR Code */}
    <div className="flex flex-col items-center">
      <QRCode
  value={`${process.env.NEXT_PUBLIC_APP_URL}/verify-admission/${student.admissionNumber}`}
  size={110}
/>

      <p className="text-[10px] mt-2 text-gray-500">
        Verify Admission
      </p>
    </div>

  </div>

  <div className="mt-14 flex justify-between">

    <div>
      <div className="w-48 border-b border-gray-400 mb-2"></div>
      <p className="text-sm font-semibold">
        Admissions Officer
      </p>
    </div>

    <div className="text-right">
      <div className="w-48 border-b border-gray-400 mb-2"></div>
      <p className="text-sm font-semibold">
        Principal / Head of School
      </p>
    </div>

  </div>
</div>

      <div className="mt-10 flex justify-center gap-4 print:hidden">

        <button
          onClick={() => window.print()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          Print Admission Slip
        </button>

        <button
          onClick={() => window.history.back()}
          className="border px-6 py-3 rounded-lg hover:bg-gray-100"
        >
          Back
        </button>

      </div>

    </div>
  );
}



function Field({
  title,
  value,
}: {
  title: string;
  value: any;
}) {
  return (
    <div>
      <p className="text-xs uppercase text-gray-500">
        {title}
      </p>

      <p className="font-semibold">
        {value || "-"}
      </p>
    </div>
  );
}