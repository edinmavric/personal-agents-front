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
    return new Promise((resolve) => {
        setTimeout(() => {
        const agent = agentsData.find((agent) => agent.id === agentId)
        if (agent) {
            const user = usersData.find((user) => user.id === userId)
            if (user) {
                user.subscribed_agents.push(agentId)            }
        }
        resolve(agent)
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
                            agent.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTags = tags.length === 0 || tags.some(tag => agent.tags.includes(tag));
        return matchesSearch && matchesTags;
      });

      const sorted = filtered.sort((a, b) => {
        switch (sortBy) {
          case 'rating':
            return b.rating - a.rating;
          case 'price_asc':
            return parseFloat(a.price.replace('$', '')) - parseFloat(b.price.replace('$', ''));
          case 'price_desc':
            return parseFloat(b.price.replace('$', '')) - parseFloat(a.price.replace('$', ''));
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
      resolve(user?.subscribed_agents.includes(agentId) || false);
    }, 500);
  });
};
