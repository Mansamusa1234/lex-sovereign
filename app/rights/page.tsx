import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Know Your Rights — Police, Courts, Government, Debt | Lex Sovereign',
  description: 'Your rights when dealing with police, courts, debt collectors, government agencies, HMRC, DWP, councils, and social services. Real law. Free access.',
}

const RIGHTS_SECTIONS = [
  {
    id: 'police',
    icon: '🚔',
    title: 'Police Rights',
    subtitle: 'When dealing with law enforcement',
    color: 'blue',
    gradient: 'from-blue-900/40 to-slate-900',
    border: 'border-blue-500/30',
    accent: 'text-blue-400',
    rights: [
      { title: 'Right to Remain Silent', law: '5th Amendment (US) / PACE Code C (UK)', desc: 'You do not have to answer questions beyond identifying yourself in some states/jurisdictions. "No comment" is a legal response.' },
      { title: 'Right to Know Why You\'re Being Stopped', law: 'PACE Act 1984 s.1 (UK) / Terry v. Ohio (US)', desc: 'Police must have reasonable suspicion before stopping and searching you. They must explain the basis for the stop.' },
      { title: 'Right to a Solicitor/Attorney', law: 'PACE Code C (UK) / 6th Amendment (US)', desc: 'If arrested, you have the right to free legal advice before and during questioning. You can request this at any time.' },
      { title: 'Right Against Unlawful Search', law: '4th Amendment (US) / PACE s.1 (UK)', desc: 'Police generally need a warrant or reasonable grounds to search you, your home, or your vehicle.' },
      { title: 'Police Codes of Conduct', law: 'Police (Conduct) Regulations 2020 (UK) / IOPC', desc: 'Officers must act with honesty, integrity, and treat people with fairness and respect. Misconduct can be reported to the IOPC (UK) or Internal Affairs (US).' },
      { title: 'Right to Film Police', law: 'General public right (UK/US)', desc: 'In most jurisdictions you have the right to film police officers performing their public duties in a public place, as long as you do not interfere.' },
      { title: 'Stop and Account (UK)', law: 'Police Reform Act 2002', desc: 'Police CAN ask what you\'re doing in an area. You are NOT legally required to answer these questions unless under a specific power (like s.60).' },
      { title: 'Section 60 Stop & Search (UK)', law: 'Criminal Justice & Public Order Act 1994 s.60', desc: 'Allows police to stop and search anyone in a defined area for up to 24 hours without needing individual suspicion. Must be authorised by a senior officer.' },
    ],
  },
  {
    id: 'debt',
    icon: '💰',
    title: 'Debt & Credit Rights',
    subtitle: 'Against debt collectors & creditors',
    color: 'amber',
    gradient: 'from-amber-900/30 to-slate-900',
    border: 'border-amber-500/30',
    accent: 'text-amber-400',
    rights: [
      { title: 'Right to Debt Validation', law: 'FDCPA 15 U.S.C. § 1692g (US)', desc: 'Send a written dispute within 30 days. Collector must cease collection until they verify the debt.' },
      { title: 'Right to Stop Calls', law: 'FDCPA 15 U.S.C. § 1692c (US)', desc: 'Send a cease and desist letter. Collectors can only contact you once more after receiving it — to confirm they\'re stopping.' },
      { title: 'Right to Dispute Credit Report Errors', law: 'FCRA 15 U.S.C. § 1681 (US)', desc: 'Credit bureaus must investigate disputes within 30 days and remove inaccurate information.' },
      { title: 'Consumer Credit Act Rights (UK)', law: 'Consumer Credit Act 1974 (UK)', desc: 'Creditors must give you proper notice before action. You have rights to settlement statements, early repayment, and unfair relationship claims.' },
      { title: 'Statute of Limitations on Debt', law: 'Varies by state/jurisdiction', desc: 'After the limitation period, collectors cannot sue to collect. UK: 6 years from last payment/acknowledgment (Limitation Act 1980).' },
      { title: 'Harassment is Illegal', law: 'FDCPA s.806 (US) / FCA Regulations (UK)', desc: 'Calling repeatedly, using abusive language, threatening illegal action — all prohibited. Document and report violations.' },
    ],
  },
  {
    id: 'courts',
    icon: '⚖',
    title: 'Court Rights',
    subtitle: 'In any court proceeding',
    color: 'purple',
    gradient: 'from-purple-900/30 to-slate-900',
    border: 'border-purple-500/30',
    accent: 'text-purple-400',
    rights: [
      { title: 'Right to a Fair Trial', law: 'Article 6 ECHR / 6th Amendment (US)', desc: 'You have the right to a public hearing before an independent and impartial tribunal within a reasonable time.' },
      { title: 'Right to Legal Representation', law: '6th Amendment (US) / Article 6(3)(c) ECHR', desc: 'In criminal cases, you have the right to legal representation. If you cannot afford it, the state must provide it.' },
      { title: 'Pro Se / Litigant in Person', law: '28 U.S.C. § 1654 (US) / UK Courts', desc: 'You have the right to represent yourself in court. UK: Litigants in Person have rights to assistance and have documents read in accessible language.' },
      { title: 'Right to Know the Charge/Claim', law: 'Due Process / ECHR Art. 6(3)(a)', desc: 'You must be told clearly what you are accused of or what is being claimed against you, in language you understand.' },
      { title: 'Small Claims Court (UK)', law: 'Civil Procedure Rules Part 27', desc: 'Claims up to £10,000 can be handled in small claims. No solicitor needed. Filing fee from £35. For consumer disputes, employment, and money claims.' },
      { title: 'Statutory Demands (UK)', law: 'Insolvency Act 1986', desc: 'If you receive a statutory demand for £750+ from a creditor, you have 18 days to apply to court to have it set aside, and 21 days to pay.' },
      { title: 'County Court Judgment (CCJ)', law: 'County Court Act 1984 (UK)', desc: 'A CCJ stays on your credit file for 6 years. If paid within 30 days of judgment, you can apply to have it removed from the register.' },
    ],
  },
  {
    id: 'government',
    icon: '🏛',
    title: 'Government Agency Rights',
    subtitle: 'HMRC, DWP, councils, NHS, immigration',
    color: 'emerald',
    gradient: 'from-emerald-900/30 to-slate-900',
    border: 'border-emerald-500/30',
    accent: 'text-emerald-400',
    rights: [
      { title: 'Right to Appeal Government Decisions', law: 'Tribunals, Courts and Enforcement Act 2007 (UK)', desc: 'Almost every government decision can be appealed. Start with an internal review, then appeal to the relevant tribunal (Social Security, Tax, Immigration, etc.).' },
      { title: 'HMRC Rights (UK)', law: 'Taxpayer Charter / CRCA 2005', desc: 'You have the right to expect HMRC to apply the law correctly, to appeal decisions, to be treated fairly, and to have decisions reviewed. HMRC must give 30 days notice before taking enforcement action.' },
      { title: 'DWP / Benefits Rights (UK)', law: 'Social Security Administration Act 1992', desc: 'All DWP benefit decisions can be challenged: request a mandatory reconsideration first (1 month limit), then appeal to Social Security & Child Support Tribunal.' },
      { title: 'Right to Information (FOIA)', law: 'Freedom of Information Act 2000 (UK) / 5 U.S.C. § 552 (US)', desc: 'Request information held by public authorities. Responses due within 20 working days. Refusal can be appealed to the Information Commissioner (UK).' },
      { title: 'Right to Access Personal Data', law: 'UK GDPR / GDPR (EU) / CCPA (California)', desc: 'Subject Access Request (SAR): any organisation holding your data must provide it free within 30 days. This includes government agencies, employers, banks.' },
      { title: 'Local Council Rights (UK)', law: 'Local Government Act 1972 / Localism Act 2011', desc: 'You can attend and speak at council meetings, access council documents, appeal planning decisions, challenge council tax decisions, and complain to the Local Government Ombudsman.' },
      { title: 'NHS Rights (UK)', law: 'NHS Constitution 2015', desc: 'Right to be treated with dignity, access NHS services within maximum waiting times, see your medical records, receive a second opinion, complain, and have complaints investigated.' },
      { title: 'Immigration Rights', law: 'Immigration Act 1971 / Human Rights Act 1998', desc: 'You have rights even without documents: right not to be tortured or returned to danger (Article 3 ECHR), right to appeal deportation, right to legal advice before interview.' },
    ],
  },
  {
    id: 'employment',
    icon: '💼',
    title: 'Employment Rights',
    subtitle: 'At work and after termination',
    color: 'rose',
    gradient: 'from-rose-900/30 to-slate-900',
    border: 'border-rose-500/30',
    accent: 'text-rose-400',
    rights: [
      { title: 'Unfair Dismissal (UK)', law: 'Employment Rights Act 1996', desc: 'After 2 years of service, you cannot be dismissed without a fair reason and fair procedure. Claim at Employment Tribunal within 3 months of dismissal.' },
      { title: 'Discrimination at Work', law: 'Equality Act 2010 (UK) / Title VII (US)', desc: 'Protected characteristics: age, disability, gender reassignment, marriage, pregnancy, race, religion, sex, sexual orientation. Tribunal time limit: 3 months.' },
      { title: 'Statutory Minimum Pay', law: 'National Minimum Wage Act 1998 (UK)', desc: 'Minimum wage rates apply to all workers. Non-compliance can be reported to HMRC. Employers can be named and fined 200% of unpaid wages.' },
      { title: 'Right to Written Terms', law: 'Employment Rights Act 1996 s.1 (UK)', desc: 'You must receive written employment particulars on day one of employment. Failure gives you up to 4 weeks\' pay compensation.' },
      { title: 'Whistleblowing Protection', law: 'Public Interest Disclosure Act 1998 (UK)', desc: 'Reporting wrongdoing in the public interest (protected disclosure) gives you protection from dismissal or detriment. No qualifying period of service required.' },
    ],
  },
  {
    id: 'consumer',
    icon: '🛒',
    title: 'Consumer Rights',
    subtitle: 'Shopping, contracts, services',
    color: 'cyan',
    gradient: 'from-cyan-900/30 to-slate-900',
    border: 'border-cyan-500/30',
    accent: 'text-cyan-400',
    rights: [
      { title: '30-Day Right to Reject (UK)', law: 'Consumer Rights Act 2015', desc: 'Goods must be of satisfactory quality, fit for purpose, and as described. Within 30 days of purchase, you can get a full refund for faulty goods.' },
      { title: 'Right to Repair or Replace', law: 'Consumer Rights Act 2015 (UK)', desc: 'After 30 days, you can claim repair or replacement (first attempt free). If repair/replacement fails, you can claim a price reduction or final right to reject.' },
      { title: 'Digital Content Rights (UK)', law: 'Consumer Rights Act 2015 Pt. 1', desc: 'Digital downloads (apps, games, software, streaming) must be of satisfactory quality. You have rights if they develop faults.' },
      { title: 'Section 75 Credit Card Protection', law: 'Consumer Credit Act 1974 s.75 (UK)', desc: 'If you paid £100-£30,000 on a credit card, your card company is jointly liable with the retailer for breach of contract or misrepresentation.' },
      { title: 'Doorstep / Distance Selling (UK)', law: 'Consumer Contracts Regulations 2013', desc: '14-day cooling-off period for goods bought online, over the phone, or at your door. Seller must tell you about this right — if they don\'t, your right extends to 12 months.' },
      { title: 'Unfair Contract Terms', law: 'Consumer Rights Act 2015 Pt. 2 (UK)', desc: 'Unfair terms in consumer contracts are not binding. A term is unfair if, contrary to good faith, it causes significant imbalance between the parties.' },
    ],
  },
]

export default function RightsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="legal-grid" aria-hidden />
      <div className="ambient-glow" aria-hidden />

      {/* Nav */}
      <nav className="relative z-10 border-b border-amber-500/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 text-lg">⚖</div>
            <div>
              <p className="text-white font-black text-sm">Lex Sovereign</p>
              <p className="text-amber-400/60 text-[10px] font-mono tracking-widest uppercase">Know Your Rights</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-slate-400 hover:text-amber-400 text-sm transition-colors">Plans</Link>
            <Link href="/dashboard" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-sm transition-colors">
              Open AI Brain →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-6 pt-16 pb-12 text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-amber-400/60 text-xs font-mono tracking-[0.3em] uppercase mb-6">Open Source · Free Access · Real Law</p>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-none mb-4">
            KNOW YOUR<br/><span className="gold-gradient">RIGHTS.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
            Police. Courts. Debt collectors. Government agencies. Employment. Consumer rights.
            Real law. Plain English. Share freely.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {RIGHTS_SECTIONS.map(s => (
              <a key={s.id} href={`#${s.id}`}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-amber-500/30 rounded-full text-sm text-slate-400 hover:text-white transition-colors">
                <span>{s.icon}</span>{s.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Rights sections */}
      <div className="relative z-10 px-6 pb-20 space-y-12 max-w-7xl mx-auto">
        {RIGHTS_SECTIONS.map(section => (
          <section key={section.id} id={section.id}
            className={`rounded-3xl border ${section.border} bg-gradient-to-br ${section.gradient} overflow-hidden`}>
            {/* Section header */}
            <div className="px-8 py-8 border-b border-slate-800/60">
              <div className="flex items-center gap-4">
                <div className="text-5xl">{section.icon}</div>
                <div>
                  <h2 className={`text-3xl font-black ${section.accent}`}>{section.title}</h2>
                  <p className="text-slate-400 text-sm mt-1">{section.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Rights grid */}
            <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.rights.map(right => (
                <div key={right.title}
                  className="bg-slate-900/60 border border-slate-800/60 hover:border-slate-700 rounded-2xl p-5 transition-all backdrop-blur-sm group">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-white font-bold text-sm leading-tight">{right.title}</h3>
                  </div>
                  <p className={`text-xs font-mono mb-2.5 ${section.accent} opacity-70`}>{right.law}</p>
                  <p className="text-slate-400 text-xs leading-relaxed">{right.desc}</p>
                </div>
              ))}
            </div>

            {/* Use AI to research */}
            <div className="px-8 py-5 border-t border-slate-800/60">
              <Link href="/dashboard"
                className={`inline-flex items-center gap-2 text-sm font-semibold ${section.accent} hover:opacity-80 transition-opacity`}>
                Ask the AI Brain about your {section.title.toLowerCase()} →
              </Link>
            </div>
          </section>
        ))}
      </div>

      {/* CTA */}
      <div className="relative z-10 px-6 py-16 text-center border-t border-amber-500/10">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-black text-white mb-4 gold-gradient">Use the AI Brain</h2>
          <p className="text-slate-400 mb-8">
            Ask Sovereign, Lex, and Aria about any of these rights. They search your knowledge base,
            cite real law, and draft professional responses — with your approval always required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard"
              className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition-all hover:shadow-2xl hover:shadow-amber-500/30">
              Open AI Brain Free →
            </Link>
            <Link href="/pricing"
              className="px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold rounded-xl transition-all">
              View Plans
            </Link>
          </div>
          <p className="text-slate-700 text-xs mt-6 font-mono">
            Not a law firm · Not legal advice · Always consult a qualified attorney
          </p>
        </div>
      </div>
    </div>
  )
}
