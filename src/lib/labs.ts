export type VulnType = 'XSS' | 'SQLi' | 'CSRF' | 'Broken Auth' | 'IDOR';
export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface Payload {
  label: string;
  value: string;
  description: string;
}

export interface CodeDiff {
  filename: string;
  vulnerable: string;
  patched: string;
  explanation: string;
}

export interface Lab {
  slug: string;
  title: string;
  subtitle: string;
  vulnType: VulnType;
  severity: Severity;
  cvssScore: number;
  description: string;
  whatYouLearn: string[];
  payloads: Payload[];
  codeDiffs: CodeDiff[];
  realWorldExample: string;
  owaspRef: string;
}

export const LABS: Lab[] = [
  {
    slug: 'xss-reflected',
    title: 'Reflected XSS',
    subtitle: "Your input runs as code in someone's browser.",
    vulnType: 'XSS',
    severity: 'high',
    cvssScore: 7.4,
    description:
      'Search reflects user input back into the page. In vulnerable mode, that input is rendered as HTML and runs.',
    whatYouLearn: [
      'Why innerHTML is dangerous with user input',
      'How textContent blocks script execution',
      'How reflected XSS is usually delivered by links'
    ],
    payloads: [
      { label: 'Basic alert', value: '<script>alert("XSS")</script>', description: 'Simple proof of concept.' },
      {
        label: 'Image onerror',
        value: '<img src=x onerror="alert(\'XSS: \'+document.cookie)">',
        description: 'Executes through an event handler.'
      }
    ],
    codeDiffs: [
      {
        filename: 'Client rendering (XSSReflectedLab.tsx)',
        vulnerable: '// VULNERABLE\nresultsDiv.innerHTML = "Results for: " + query; // ← vulnerable',
        patched: '// PATCHED\nresultsDiv.textContent = "Results for: " + query; // ← fixed',
        explanation: 'This is the one-line fix. textContent renders plain text, not HTML.'
      }
    ],
    realWorldExample: 'Reflected XSS is still used in phishing links to steal active sessions.',
    owaspRef: 'OWASP A03:2021 / CWE-79'
  },
  {
    slug: 'xss-stored',
    title: 'Stored XSS',
    subtitle: 'Attack everyone who opens the page.',
    vulnType: 'XSS',
    severity: 'critical',
    cvssScore: 8.8,
    description: 'Comments are persisted and replayed to every visitor. Raw HTML means persistent script execution.',
    whatYouLearn: ['Why stored XSS is worse than reflected XSS', 'Server-side escaping + client-side safe render'],
    payloads: [
      {
        label: 'Cookie theft script',
        value: '<script>fetch("/api/steal?c="+document.cookie)</script>',
        description: 'Runs for every user who views comments.'
      }
    ],
    codeDiffs: [
      {
        filename: 'src/app/api/vuln/comments/route.ts',
        vulnerable: "db.prepare('INSERT INTO comments (user_id, username, content) VALUES (?, ?, ?)').run(uid, name, content); // ← vulnerable",
        patched: "db.prepare('INSERT INTO comments (user_id, username, content, content_safe) VALUES (?, ?, ?, ?)').run(uid, name, content, escapeHtml(content)); // ← fixed",
        explanation: 'Encode the payload before storing or rendering so it is displayed, never executed.'
      }
    ],
    realWorldExample: 'Stored XSS can infect entire user populations with one post.',
    owaspRef: 'OWASP A03:2021 / CWE-79'
  },
  {
    slug: 'sqli',
    title: 'SQL Injection',
    subtitle: 'Login bypass with one payload.',
    vulnType: 'SQLi',
    severity: 'critical',
    cvssScore: 9.8,
    description: 'The vulnerable login route concatenates strings directly into SQL.',
    whatYouLearn: ['How SQL string concatenation gets exploited', 'Why prepared statements work'],
    payloads: [
      {
        label: 'Admin bypass',
        value: "admin' --",
        description: 'Comments out password check.'
      },
      {
        label: 'OR 1=1',
        value: "' OR '1'='1' --",
        description: 'Always true WHERE condition.'
      }
    ],
    codeDiffs: [
      {
        filename: 'src/app/api/vuln/login/route.ts',
        vulnerable:
          "const query = `SELECT * FROM users WHERE username='${username}' AND password='${md5Password}'`;\nconst user = db.prepare(query).get(); // ← vulnerable",
        patched:
          "const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username); // ← fixed\nconst ok = bcrypt.compareSync(password, user.password_secure);",
        explanation: 'Placeholders keep user input as data, never executable SQL syntax.'
      }
    ],
    realWorldExample: 'SQLi still causes account takeover and full database dumps.',
    owaspRef: 'OWASP A03:2021 / CWE-89'
  },
  {
    slug: 'csrf',
    title: 'CSRF',
    subtitle: 'Trigger state changes from another site.',
    vulnType: 'CSRF',
    severity: 'high',
    cvssScore: 8.1,
    description: 'Change-email endpoint trusts requests without validating a session-bound CSRF token.',
    whatYouLearn: ['Why CORS is not CSRF protection', 'How synchronizer tokens block forged requests'],
    payloads: [
      {
        label: 'Auto-submit form',
        value:
          '<form action="http://localhost:3000/api/vuln/change-email" method="POST"><input name="newEmail" value="attacker@evil.com"></form>',
        description: 'Victim browser sends session automatically.'
      }
    ],
    codeDiffs: [
      {
        filename: 'src/app/api/vuln/change-email/route.ts',
        vulnerable: 'if (!session) return 401;\n// no csrf check // ← vulnerable',
        patched: 'if (!validateCsrfToken(csrfToken, session.csrfToken)) return 403; // ← fixed',
        explanation: 'Attacker pages cannot read the token, so forged writes fail.'
      }
    ],
    realWorldExample: 'CSRF has repeatedly been used to change account settings silently.',
    owaspRef: 'OWASP A01:2021 / CWE-352'
  },
  {
    slug: 'broken-auth',
    title: 'Broken Authentication',
    subtitle: 'MD5 passwords are crackable at scale.',
    vulnType: 'Broken Auth',
    severity: 'critical',
    cvssScore: 9.1,
    description: 'Vulnerable registration stores MD5 password hashes which are fast and unsalted.',
    whatYouLearn: ['Why fast hashes fail for passwords', 'Why bcrypt cost factor matters'],
    payloads: [
      {
        label: 'MD5(password)',
        value: '5f4dcc3b5aa765d61d8327deb882cf99',
        description: 'Known rainbow-table hash for "password".'
      }
    ],
    codeDiffs: [
      {
        filename: 'src/app/api/vuln/register/route.ts',
        vulnerable: "const hash = crypto.createHash('md5').update(password).digest('hex'); // ← vulnerable",
        patched: 'const hash = await bcrypt.hash(password, 12); // ← fixed',
        explanation: 'bcrypt is intentionally slow and salted per password.'
      }
    ],
    realWorldExample: 'Leaked unsalted hashes are cracked in bulk very quickly.',
    owaspRef: 'OWASP A07:2021 / CWE-916'
  },
  {
    slug: 'idor',
    title: 'IDOR',
    subtitle: 'Read other users by changing the ID.',
    vulnType: 'IDOR',
    severity: 'high',
    cvssScore: 8.2,
    description: 'Vulnerable profile endpoint returns any requested user object for any logged-in user.',
    whatYouLearn: ['Ownership checks', 'Minimizing exposed fields'],
    payloads: [
      {
        label: 'Access admin profile',
        value: '/api/vuln/users/1',
        description: 'Any user can read admin profile in vulnerable mode.'
      }
    ],
    codeDiffs: [
      {
        filename: 'src/app/api/vuln/users/[id]/route.ts',
        vulnerable: 'const user = db.prepare(\'SELECT * FROM users WHERE id = ?\').get(params.id); // ← vulnerable',
        patched:
          "if (session.userId !== targetId && session.role !== 'admin') return 403; // ← fixed\nconst user = db.prepare('SELECT id, username, email, role, created_at FROM users WHERE id = ?').get(targetId);",
        explanation: 'Authorize resource access and never return password fields.'
      }
    ],
    realWorldExample: 'IDOR is one of the most common access control failures in APIs.',
    owaspRef: 'OWASP A01:2021 / CWE-639'
  }
];

export function getLabBySlug(slug: string): Lab | undefined {
  return LABS.find((lab) => lab.slug === slug);
}
