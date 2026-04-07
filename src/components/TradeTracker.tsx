'use client';
import { useAppStore } from '@/store/useAppStore';
import { motion } from 'framer-motion';
import { ListTree, CheckCircle2, Clock } from 'lucide-react';
import styles from './TradeTracker.module.css';

export default function TradeTracker() {
  const { isMockMode } = useAppStore();

  const mockOrders = [
    { id: '1', symbol: 'HDFC', type: 'BUY', qty: 50, price: 1530.25, status: 'EXECUTED', time: '10:14 AM' },
    { id: '2', symbol: 'RELIANCE', type: 'SELL', qty: 25, price: 2580.00, status: 'PENDING', time: '11:45 AM' },
    { id: '3', symbol: 'TVSMOTOR', type: 'BUY', qty: 100, price: 2014.10, status: 'EXECUTED', time: '13:20 PM' },
  ];

  const orders = isMockMode ? mockOrders : [];

  return (
    <div className={`glass-panel ${styles.trackerPanel}`}>
      <div className={styles.header}>
        <ListTree size={20} />
        <h3>Trade Tracker</h3>
      </div>

      <div className={styles.orderList}>
        {orders.length > 0 ? orders.map((order, i) => (
          <motion.div 
            key={order.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={styles.orderItem}
          >
            <div className={styles.iconBox}>
              {order.status === 'EXECUTED' ? 
                <CheckCircle2 className={styles.iconExecuted} size={20} /> : 
                <Clock className={styles.iconPending} size={20} />
              }
            </div>
            <div className={styles.orderDetails}>
              <h4>{order.symbol}</h4>
              <p className={styles.metaData}>{order.time} &bull; {order.type}</p>
            </div>
            <div className={styles.orderPrices}>
              <span className={styles.qty}>{order.qty}x</span>
              <span className={styles.price}>${order.price.toLocaleString()}</span>
            </div>
          </motion.div>
        )) : (
          <p className={styles.noData}>No orders tracked for today.</p>
        )}
      </div>
    </div>
  );
}
