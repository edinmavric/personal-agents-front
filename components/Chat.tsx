import { useTheme } from '@/contexts/ThemeContext';

interface ChatProps {
  agent: {
    id: string;
    name: string;
    description: string;
    system_prompt: string;
    categories: string[];
    appearance?: {
      accent?: string;
      iconColor?: string;
      bgColor?: string;
      iconInitial?: string;
    };
  };
}

export default function Chat({ agent }: ChatProps) {
  const { isDarkMode } = useTheme();

  const getThemeClasses = () => {
    const baseTheme = agent.name.toLowerCase().includes('health') 
      ? !agent.name.toLowerCase().includes('mental')
        ? 'health-agent'
        : 'mental-health-agent'
      : '';
    
    return `min-h-screen ${baseTheme} ${isDarkMode ? 'dark' : ''}`.trim();
  };

  return (
    <div className={getThemeClasses()}>
      <div className="p-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {agent.name}
            </h2>
            {/* Chat messages would go here */}
            <div className="space-y-4">
              {/* Example message */}
              <div className="bg-muted p-3 rounded-lg text-foreground">
                <p>How can I help you today?</p>
              </div>
            </div>
            
            {/* Chat input */}
            <div className="mt-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 bg-background border border-input rounded-lg px-4 py-2 text-foreground"
                  placeholder="Type your message..."
                />
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
