// Owner: Person B. Case file view (PDF export via @react-pdf/renderer) — not implemented yet.
export default function CasePage({ params }: { params: { groupId: string } }) {
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold">Case {params.groupId}</h1>
      <p className="text-sm text-muted-foreground">Case file coming soon.</p>
    </div>
  );
}
