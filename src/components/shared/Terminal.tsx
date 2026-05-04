import styles from './Terminal.module.css';

export default function Terminal({ text }: { text: string }) {
  return <pre className={`${styles.terminal} code`}>{text}</pre>;
}
