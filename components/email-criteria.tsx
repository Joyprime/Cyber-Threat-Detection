export function EmailCriteria() {
  const criteria = [
    {
      title: "Urgency",
      description: "Messages creating pressure to act quickly",
      examples: ["Act now!", "Immediate action required", "Urgent response needed"]
    },
    {
      title: "Poor Grammar",
      description: "Unusual formatting or grammatical errors",
      examples: ["ALL CAPS", "Multiple!!!", "Broken sentences"]
    },
    {
      title: "Sensitive Information",
      description: "Requests for personal or confidential data",
      examples: ["Verify password", "Confirm SSN", "Update account details"]
    },
    {
      title: "Generic Greeting",
      description: "Non-specific or impersonal salutations",
      examples: ["Dear Sir/Madam", "Dear User", "Dear Customer"]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
      {criteria.map((item, index) => (
        <div key={index} className="space-y-2">
          <h3 className="text-sm font-semibold text-primary">{item.title}</h3>
          <p className="text-sm text-muted-foreground">{item.description}</p>
          <div className="flex flex-wrap gap-2">
            {item.examples.map((example, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
              >
                {example}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}