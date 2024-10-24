export function BruteForceCriteria() {
  const criteria = [
    {
      title: "Frequency",
      description: "Number of attempts in a time window",
      examples: ["30+ attempts/minute", "100+ attempts/hour", "Rapid successive tries"]
    },
    {
      title: "IP Patterns",
      description: "Suspicious IP address behavior",
      examples: ["Multiple IPs", "Known bad IPs", "Geographic anomalies"]
    },
    {
      title: "Time Analysis",
      description: "Temporal patterns of attempts",
      examples: ["Off-hours access", "Consistent intervals", "Automated timing"]
    },
    {
      title: "Target Analysis",
      description: "Attack targeting patterns",
      examples: ["Single user focus", "System account targeting", "Sequential attempts"]
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