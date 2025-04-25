import {agentsData} from "@/lib/data/agents"
import {usersData} from "@/lib/data/users"

export const fetchAgents = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
        resolve(agentsData)
        }, 1000)
    })
}

export const fetchAgent = async (id: number) => {
    return new Promise((resolve) => {
        setTimeout(() => {
        const agent = agentsData.find((agent) => agent.id === id)
        resolve(agent)
        }, 1000)
    })
}

export const fetchUsers = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
        resolve(usersData)
        }, 1000)
    })
}
export const fetchUser = async (id: number) => {
    return new Promise((resolve) => {
        setTimeout(() => {
        const user = usersData.find((user) => user.id === id)
        resolve(user)
        }, 1000)
    })
}

export const subscribeToAgent = async (userId: number, agentId:number) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
        const agent = agentsData.find((agent) => agent.id === agentId);
        const user = usersData.find((user) => user.id === userId);

        if (!agent) {
            return reject(new Error("Agent not found"));
        }
        if (!user) {
            return reject(new Error("User not found"));
        }
        if (!user.chat_history) {
            user.chat_history = {
              1: []
            };
        }
        if (!user.subscribed_agents) {
            user.subscribed_agents = [];
        }

        if (!user.subscribed_agents.includes(agentId)) {
            user.subscribed_agents.push(agentId);
            // Ensure the key is a string if chat_history keys are expected to be strings
            const agentIdStr = agentId.toString();
            if (!user.chat_history[agentIdStr]) {
                 user.chat_history[agentIdStr] = [];
            }
            resolve({ success: true, message: "Subscribed successfully" });
        } else {
            resolve({ success: false, message: "Already subscribed" });
        }
        }, 1000)
    })
}

export const searchAndFilterAgents = async (
  searchQuery: string = '',
  tags: string[] = [],
  sortBy: 'rating' | 'price_asc' | 'price_desc' = 'rating'
) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = agentsData.filter(agent => {
        const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            agent.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesTags = tags.length === 0 || tags.some(tag => agent.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase()));
        return matchesSearch && matchesTags;
      });

      const sorted = filtered.sort((a, b) => {
        const priceA = parseFloat(String(a.price).replace(/[^0-9.-]+/g,""));
        const priceB = parseFloat(String(b.price).replace(/[^0-9.-]+/g,""));

        switch (sortBy) {
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'price_asc':
            return (isNaN(priceA) ? Infinity : priceA) - (isNaN(priceB) ? Infinity : priceB);
          case 'price_desc':
            return (isNaN(priceB) ? -Infinity : priceB) - (isNaN(priceA) ? -Infinity : priceA);
          default:
            return 0;
        }
      });

      resolve(sorted);
    }, 500);
  });
};

export const checkSubscription = async (userId: number, agentId: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = usersData.find(user => user.id === userId);
      resolve(user?.subscribed_agents?.includes(agentId) || false);
    }, 500);
  });
};

export const fetchChatHistory = async (userId: number, agentId: number) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = usersData.find(user => user.id === userId);
      if (!user) {
        return reject(new Error("User not found"));
      }
      if (!user.chat_history) {
          user.chat_history = {
            1: []
          };
      }
      // Ensure the key is a string if chat_history keys are expected to be strings
      const agentIdStr = agentId.toString();
      const history = (user.chat_history as { [key: string]: any[] })[agentIdStr] || [];
      resolve(history);
    }, 300);
  });
};

export const sendMessage = async (userId: number, agentId: number, messageContent: string) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = usersData.find(user => user.id === userId);
      const agent = agentsData.find(agent => agent.id === agentId);

      if (!user) {
        return reject(new Error("User not found"));
      }
      if (!agent) {
        return reject(new Error("Agent not found"));
      }
      if (!user.chat_history) {
          user.chat_history = {
            1: []
          };
      }
      // Ensure the key is a string if chat_history keys are expected to be strings
      const agentIdStr = agentId.toString();
      if (!user.chat_history[agentIdStr]) {
          user.chat_history[agentIdStr] = [];
      }

      const userMessage = {
        role: 'user',
        message: messageContent,
        timestamp: new Date().toISOString(),
      };
      user.chat_history[agentIdStr].push(userMessage);

      const agentResponse = {
        role: 'assistant',
        message: `Simulated response from ${agent.name}: Acknowledged "${messageContent}"`,
        timestamp: new Date().toISOString(),
      };

      setTimeout(() => {
        user.chat_history[agentIdStr].push(agentResponse);
        resolve(agentResponse);
      }, 700);

    }, 300);
  });
};
