import React, { useEffect, useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Task } from '../types';

interface SearchResultItem {
  id: string;
  title: string;
  description?: string;
  type: 'task' | 'habit' | 'note' | 'document';
  url: string;
  date?: Date;
}

const SearchResults: React.FC = () => {
  const location = useLocation();
  const { state } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const query = new URLSearchParams(location.search).get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
    
    return () => {
      // Clear any pending timeouts when component unmounts
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [location.search]);

  const performSearch = (query: string) => {
    setLoading(true);
    
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Simulate search results from tasks
    searchTimeoutRef.current = setTimeout(() => {
      const taskResults: SearchResultItem[] = state.tasks
        .filter((task: Task) => 
          task.title.toLowerCase().includes(query.toLowerCase()) || 
          (task.description && task.description.toLowerCase().includes(query.toLowerCase()))
        )
        .map((task: Task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          type: 'task',
          url: `/tasks?id=${task.id}`,
          date: new Date(task.createdAt)
        }));
      
      // In a real app, you would search other content types as well
      setResults(taskResults);
      setLoading(false);
      searchTimeoutRef.current = null;
    }, 500);
  };

  const filterResults = (type: string | null) => {
    setFilter(type);
  };

  const filteredResults = filter 
    ? results.filter(item => item.type === filter) 
    : results;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gradient">Search Results</h1>
        <div className="flex items-center gap-2 glass px-4 py-2 rounded-xl min-w-80">
          <Search size={20} className="text-white/60" />
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.currentTarget.querySelector('input');
              if (input && input.value.trim()) {
                performSearch(input.value.trim());
              }
            }}
            className="flex-1"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, habits, or notes..."
              className="w-full bg-transparent text-white placeholder-white/60 focus:outline-none"
            />
          </form>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Button 
          variant={!filter ? 'primary' : 'secondary'} 
          onClick={() => filterResults(null)}
        >
          All
        </Button>
        <Button 
          variant={filter === 'task' ? 'primary' : 'secondary'} 
          onClick={() => filterResults('task')}
        >
          Tasks
        </Button>
        <Button 
          variant={filter === 'habit' ? 'primary' : 'secondary'} 
          onClick={() => filterResults('habit')}
        >
          Habits
        </Button>
        <Button 
          variant={filter === 'note' ? 'primary' : 'secondary'} 
          onClick={() => filterResults('note')}
        >
          Notes
        </Button>
        <Button 
          variant={filter === 'document' ? 'primary' : 'secondary'} 
          onClick={() => filterResults('document')}
        >
          Documents
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      ) : filteredResults.length > 0 ? (
        <div className="space-y-4">
          <p className="text-white/60">Found {filteredResults.length} results for "{searchQuery}"</p>
          
          {filteredResults.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:border-primary-500/50 transition-colors">
                <Link to={item.url} className="block p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      {item.description && (
                        <p className="text-white/60 line-clamp-2 mt-1">{item.description}</p>
                      )}
                    </div>
                    <div className="bg-white/10 px-3 py-1 rounded-full text-xs">
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </div>
                  </div>
                  {item.date && (
                    <p className="text-xs text-white/40 mt-2">
                      {item.date.toLocaleDateString()}
                    </p>
                  )}
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-white/60">No results found for "{searchQuery}"</p>
          <p className="text-white/40 mt-2">Try different keywords or filters</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults; 