import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const quotes = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" }
];

export const MotivationalQuote: React.FC = () => {
  const [quote, setQuote] = useState({ text: "", author: "" });

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  return (
    <motion.div
      className="text-center p-8 glass rounded-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
    >
      <blockquote className="text-xl text-white/80 italic mb-4">
        "{quote.text}"
      </blockquote>
      <cite className="text-primary-400 font-semibold">— {quote.author}</cite>
    </motion.div>
  );
}; 