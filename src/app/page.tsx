import Link from 'next/link';
import { LABS } from '@/lib/labs';
import VulnBadge from '@/components/VulnBadge/VulnBadge';
import styles from './page.module.css';

const HOW_IT_WORKS = [
  'Pick a lab from the list below.',
  'Choose Vulnerable mode to see how the attack works for real.',
  'Switch to Patched mode and run the same payload again.',
  'Use the account panel inside each lab to register and log in as your own user.',
  'Read the code diff to see exactly what changed and why the fix works.'
];

const TERMS = [
  {
    name: 'Reflected XSS',
    short: 'Your input gets echoed back and runs as code.',
    plain: 'You type something into a field, the app puts it on the page the wrong way, and your script runs in that browser session.'
  },
  {
    name: 'Stored XSS',
    short: 'Malicious code gets saved, then hits every visitor.',
    plain: 'The payload is saved in the database (like in comments). Anyone who opens that page gets hit.'
  },
  {
    name: 'SQL Injection',
    short: 'User input changes what the database query does.',
    plain: 'Instead of being treated as normal text, your input becomes part of the SQL command and can bypass login or leak data.'
  },
  {
    name: 'CSRF',
    short: 'A user gets tricked into sending a request they did not mean to send.',
    plain: 'If someone is logged in, a malicious page can try to make their browser submit a form in the background unless token checks are in place.'
  },
  {
    name: 'Broken Authentication',
    short: 'Password handling is weak, so accounts are easy to crack.',
    plain: 'Fast hashes like MD5 are not safe for passwords. If hashes leak, attackers can reverse common ones quickly.'
  },
  {
    name: 'IDOR',
    short: 'Changing an ID in the URL gives access to someone else\'s data.',
    plain: 'If the app does not check ownership, you can request another user\'s record just by changing a number.'
  }
] as const;

export default function HomePage() {
  return (
    <main className={styles.main}>
      <header className={styles.hero}>
        <p className={styles.kicker}>VulnLab</p>
        <h1>Learn web security by actually breaking and fixing real bugs.</h1>
        <p className={styles.lead}>
          This is an intentionally vulnerable app. You run real attacks in Vulnerable mode, then switch to Patched mode and watch the same payload fail.
          It is hands-on and simple. No fluff.
        </p>
      </header>

      <section className={styles.panel}>
        <h2>What this site is</h2>
        <p>
          Most security demos only explain concepts. This one gives you the vulnerable app itself. You can test payloads, see impact, and then see the exact code fix.
        </p>
      </section>

      <section className={styles.panel}>
        <h2>How to use it</h2>
        <ol>
          {HOW_IT_WORKS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className={styles.note}>
          Quick demo login: <code className="code">alice / password</code>, <code className="code">bob / hunter2</code>, <code className="code">admin / admin123</code>
        </p>
      </section>

      <section className={styles.panel}>
        <h2>Security terms in plain language</h2>
        <div className={styles.termGrid}>
          {TERMS.map((term) => (
            <article key={term.name} className={styles.termCard}>
              <h3>{term.name}</h3>
              <p className={styles.termShort}>{term.short}</p>
              <p>{term.plain}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className={styles.labHeading}>Pick a lab</h2>
        <div className={styles.grid}>
          {LABS.map((lab) => (
            <Link key={lab.slug} href={`/lab/${lab.slug}`} className={styles.card}>
              <div className={styles.row}>
                <h3>{lab.title}</h3>
                <VulnBadge type={lab.vulnType} />
              </div>
              <p>{lab.subtitle}</p>
              <span className={styles.cta}>Open Lab</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
