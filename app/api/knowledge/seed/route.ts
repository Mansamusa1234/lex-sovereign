import { NextResponse } from 'next/server'
import { supabaseAdmin, logAudit } from '@/lib/supabase'
import { embed } from '@/lib/openai'

const LIBRARY: Array<{
  title: string
  category: 'statute' | 'case_law' | 'definition' | 'template' | 'strategy' | 'outcome'
  source: string
  tags: string[]
  content: string
}> = [

  // ── UCC — Uniform Commercial Code ──────────────────────────────────────
  {
    title: 'UCC 1-308 — Performance or Acceptance Under Reservation of Rights',
    category: 'statute', source: 'UCC § 1-308', tags: ['ucc','reservation of rights','without prejudice'],
    content: `A party that with explicit reservation of rights performs or promises performance or assents to performance in a manner demanded or offered by the other party does not thereby prejudice the rights reserved. Such words as "without prejudice," "under protest," or the like are sufficient.

Subsection (b): This section does not apply to an accord and satisfaction.

Practical application: Writing "All Rights Reserved UCC 1-308" or "Without Prejudice UCC 1-308" on a document or correspondence signals that you are not waiving any rights you may have. Courts recognize this as a valid reservation of rights in commercial transactions.

IMPORTANT: This provision applies to commercial transactions. It does not exempt a person from tax obligations, criminal law, or other non-commercial legal requirements. Courts have consistently rejected misuse of UCC 1-308 as a blanket exemption from all legal obligations.`,
  },
  {
    title: 'UCC 1-103 — Construction of UCC / Supplementary General Principles',
    category: 'statute', source: 'UCC § 1-103', tags: ['ucc','common law','equity'],
    content: `(a) The Uniform Commercial Code shall be liberally construed and applied to promote its underlying purposes and policies, which are:
(1) to simplify, clarify, and modernize the law governing commercial transactions;
(2) to permit the continued expansion of commercial practices through custom, usage, and agreement of the parties; and
(3) to make uniform the law among the various jurisdictions.

(b) Unless displaced by the particular provisions of the Uniform Commercial Code, the principles of law and equity, including the law merchant and the law relative to capacity to contract, principal and agent, estoppel, fraud, misrepresentation, duress, coercion, mistake, bankruptcy, and other validating or invalidating cause supplement its provisions.

Significance: Common law and equity principles apply to all UCC matters unless specifically overridden by UCC provisions.`,
  },
  {
    title: 'UCC 1-201 — General Definitions',
    category: 'definition', source: 'UCC § 1-201', tags: ['ucc','definitions','commercial'],
    content: `Key definitions under UCC Article 1:

"Agreement" means the bargain of the parties in fact, as found in their language or inferred from other circumstances, including course of performance, course of dealing, or usage of trade.

"Bill of lading" means a document of title evidencing the receipt of goods for shipment.

"Buyer in ordinary course of business" means a person that buys goods in good faith, without knowledge that the sale violates the rights of another person in the goods, and in the ordinary course from a person in the business of selling goods of that kind.

"Good faith" means honesty in fact and the observance of reasonable commercial standards of fair dealing.

"Holder" means the person in possession of a negotiable instrument that is payable either to bearer or to an identified person that is the person in possession.

"Notice" — a person has notice of a fact if the person: (A) has actual knowledge of it; (B) has received a notice or notification of it; or (C) from all the facts and circumstances known to the person at the time in question, has reason to know that it exists.

"Person" means an individual, corporation, business trust, estate, trust, partnership, limited liability company, association, joint venture, government, governmental subdivision, agency, or instrumentality, public corporation, or any other legal or commercial entity.

"Purchaser" means a person that takes by purchase. "Purchase" means taking by sale, lease, discount, negotiation, mortgage, pledge, lien, security interest, issue or reissue, gift, or any other voluntary transaction creating an interest in property.`,
  },
  {
    title: 'UCC 3-104 — Negotiable Instrument Definition',
    category: 'statute', source: 'UCC § 3-104', tags: ['ucc','negotiable instrument','promissory note'],
    content: `"Negotiable instrument" means an unconditional promise or order to pay a fixed amount of money, with or without interest or other charges described in the promise or order, if it:
(1) is payable to bearer or to order at the time it is issued or first comes into possession of a holder;
(2) is payable on demand or at a definite time; and
(3) does not state any other undertaking or instruction by the person promising or ordering payment to do any act in addition to the payment of money.

A promise or order that otherwise qualifies under subsection (a) is not prevented from being a negotiable instrument because it contains an undertaking or power to give, maintain, or protect collateral to secure payment.

CHECK: "Check" means (i) a draft, other than a documentary draft, payable on demand and drawn on a bank or (ii) a cashier's check or teller's check.

NOTE: "Note" means a promise that is not a certificate of deposit.

Significance: Understanding what constitutes a negotiable instrument is critical in debt and credit disputes.`,
  },
  {
    title: 'UCC 9-210 — Request for Accounting / Record of What Collateral Secures Obligation',
    category: 'statute', source: 'UCC § 9-210', tags: ['ucc','secured debt','collateral','accounting'],
    content: `A debtor or obligor may send to a secured party a record authenticated by the debtor or obligor requesting that the secured party send or make available to the debtor or obligor a record in a form that would be sufficient to release all security interests in the collateral described in the request if no other obligation were secured by the collateral.

A secured party, not later than 14 days after receiving a request under this section, shall send to the debtor or obligor a record that:
(1) identifies the obligations secured by the collateral;
(2) identifies the collateral;
(3) states the aggregate amount of unpaid secured obligations as of a specified date.

A secured party that fails without reasonable excuse to comply with a request is liable for any loss that the debtor or obligor suffers from the noncompliance.

Practical use: Use this to formally request an itemized accounting of any alleged secured debt, collateral details, and chain of ownership from a creditor or debt collector.`,
  },

  // ── Constitutional Law ─────────────────────────────────────────────────
  {
    title: '1st Amendment — Freedom of Speech, Religion, Press, Petition',
    category: 'statute', source: 'U.S. Constitution, Amendment I', tags: ['constitution','1st amendment','free speech'],
    content: `"Congress shall make no law respecting an establishment of religion, or prohibiting the free exercise thereof; or abridging the freedom of speech, or of the press; or the right of the people peaceably to assemble, and to petition the Government for a redress of grievances."

Key protections:
1. Freedom of religion (Establishment Clause + Free Exercise Clause)
2. Freedom of speech — protects most speech from government censorship
3. Freedom of the press
4. Freedom of peaceful assembly
5. Right to petition the government

Limitations: The 1st Amendment does not protect: incitement to imminent lawless action, true threats, fraud, perjury, defamation, obscenity, or speech that is "integral to criminal conduct."

Important: The 1st Amendment restricts GOVERNMENT action, not private individuals or companies.`,
  },
  {
    title: '4th Amendment — Right Against Unreasonable Search and Seizure',
    category: 'statute', source: 'U.S. Constitution, Amendment IV', tags: ['constitution','4th amendment','search','seizure','warrant'],
    content: `"The right of the people to be secure in their persons, houses, papers, and effects, against unreasonable searches and seizures, shall not be violated, and no Warrants shall issue, but upon probable cause, supported by Oath or affirmation, and particularly describing the place to be searched, and the persons or things to be seized."

Key principles:
1. Government must generally have a warrant supported by probable cause before searching
2. Warrant must specifically describe what will be searched and seized
3. Warrantless searches are presumptively unreasonable

Exceptions to warrant requirement:
- Consent searches
- Exigent circumstances (emergencies)
- Search incident to lawful arrest
- Plain view doctrine
- Terry stop (reasonable suspicion, not probable cause, for brief detentions)
- Vehicle exception (probable cause but no warrant needed)
- Inventory searches

Remedy for violation: Evidence obtained in violation of the 4th Amendment may be excluded at trial (Exclusionary Rule — Mapp v. Ohio, 367 U.S. 643).`,
  },
  {
    title: '5th Amendment — Grand Jury, Double Jeopardy, Self-Incrimination, Due Process, Takings',
    category: 'statute', source: 'U.S. Constitution, Amendment V', tags: ['constitution','5th amendment','due process','self-incrimination'],
    content: `"No person shall be held to answer for a capital, or otherwise infamous crime, unless on a presentment or indictment of a Grand Jury... nor shall any person be subject for the same offence to be twice put in jeopardy of life or limb; nor shall be compelled in any criminal case to be a witness against himself, nor be deprived of life, liberty, or property, without due process of law; nor shall private property be taken for public use, without just compensation."

Five distinct rights:
1. GRAND JURY: Serious federal crimes require grand jury indictment
2. DOUBLE JEOPARDY: Cannot be tried twice for same offense
3. SELF-INCRIMINATION: Right to remain silent; cannot be compelled to testify against yourself (applies in civil AND criminal proceedings)
4. DUE PROCESS: Government cannot deprive of life, liberty, or property without fair legal process
5. TAKINGS CLAUSE: Government must pay fair market value when taking private property

"Pleading the 5th": You can invoke your right to remain silent in any legal proceeding — civil or criminal — when your answer might tend to incriminate you in a criminal case.`,
  },
  {
    title: '6th Amendment — Right to Speedy Trial, Jury, Counsel',
    category: 'statute', source: 'U.S. Constitution, Amendment VI', tags: ['constitution','6th amendment','right to counsel','trial'],
    content: `"In all criminal prosecutions, the accused shall enjoy the right to a speedy and public trial, by an impartial jury of the State and district wherein the crime shall have been committed... to be informed of the nature and cause of the accusation; to be confronted with the witnesses against him; to have compulsory process for obtaining witnesses in his favor, and to have the Assistance of Counsel for his defence."

Key rights:
1. SPEEDY TRIAL: Criminal cases must proceed without unreasonable delay
2. PUBLIC TRIAL: Conducted in open court (some exceptions)
3. IMPARTIAL JURY: Jury of peers, free from bias
4. INFORMED OF CHARGES: Must be told specifically what you are accused of
5. CONFRONTATION: Right to cross-examine witnesses (Confrontation Clause)
6. COMPULSORY PROCESS: Can compel witnesses to testify in your defense
7. RIGHT TO COUNSEL: Guaranteed legal representation in criminal cases (Gideon v. Wainwright, 372 U.S. 335)

Right to counsel attaches: At the initiation of formal adversarial proceedings (indictment, information, arraignment).`,
  },
  {
    title: '14th Amendment — Equal Protection and Due Process (States)',
    category: 'statute', source: 'U.S. Constitution, Amendment XIV', tags: ['constitution','14th amendment','equal protection','due process'],
    content: `Section 1: "All persons born or naturalized in the United States, and subject to the jurisdiction thereof, are citizens of the United States and of the State wherein they reside. No State shall make or enforce any law which shall abridge the privileges or immunities of citizens of the United States; nor shall any State deprive any person of life, liberty, or property, without due process of law; nor deny to any person within its jurisdiction the equal protection of the laws."

Key provisions:
1. CITIZENSHIP CLAUSE: Birthright citizenship
2. PRIVILEGES OR IMMUNITIES: States cannot abridge fundamental rights
3. DUE PROCESS CLAUSE (applies to states): Incorporates most Bill of Rights protections against state action
4. EQUAL PROTECTION: Laws must treat similarly situated people equally

Levels of scrutiny:
- STRICT SCRUTINY (race, national origin, fundamental rights): Government must have compelling interest, narrowly tailored law
- INTERMEDIATE SCRUTINY (sex/gender): Important government interest, substantially related
- RATIONAL BASIS (most other classifications): Legitimate government interest, rationally related

Substantive due process: Protects fundamental rights even if government follows proper procedures.`,
  },

  // ── Procedural Law ─────────────────────────────────────────────────────
  {
    title: 'FRCP Rule 12 — Defenses and Objections',
    category: 'statute', source: 'Federal Rules of Civil Procedure, Rule 12', tags: ['frcp','procedure','motion to dismiss','defenses'],
    content: `Rule 12(b) — How to Present Defenses: A party may assert the following defenses by motion:
(1) lack of subject-matter jurisdiction
(2) lack of personal jurisdiction
(3) improper venue
(4) insufficient process
(5) insufficient service of process
(6) failure to state a claim upon which relief can be granted
(7) failure to join a party under Rule 19

Rule 12(b)(6) Motion to Dismiss: Most commonly used defense — argues that even if everything the plaintiff claims is true, there is no legal basis for the lawsuit. The complaint must state a "plausible" claim for relief (Iqbal/Twombly standard).

Rule 12(c) — Motion for Judgment on the Pleadings: Can be filed after pleadings are closed.

Rule 12(d) — Matters Outside the Pleadings: If outside matters are presented on a Rule 12(b)(6) motion, it is treated as a motion for summary judgment.

WAIVER: Rule 12(h) — defenses of lack of personal jurisdiction, improper venue, insufficient process, and insufficient service of process are WAIVED if not raised in the first responsive pleading or a Rule 12 motion.`,
  },
  {
    title: 'FRCP Rule 56 — Summary Judgment',
    category: 'statute', source: 'Federal Rules of Civil Procedure, Rule 56', tags: ['frcp','summary judgment','procedure'],
    content: `Rule 56(a) — Motion for Summary Judgment: A party may move for summary judgment, identifying each claim or defense — or the part of each claim or defense — on which summary judgment is sought. The court shall grant summary judgment if the movant shows that there is no genuine dispute as to any material fact and the movant is entitled to judgment as a matter of law.

KEY STANDARD: "No genuine dispute as to any material fact."
- A fact is "material" if it could affect the outcome
- A dispute is "genuine" if a reasonable jury could find for the non-moving party

Burden: The moving party has the initial burden of showing no genuine issue. Then the burden shifts to the non-moving party to show specific facts demonstrating a genuine issue for trial.

Time to file: Unless a different time is set by local rule or the court orders otherwise, a party may file a motion for summary judgment at any time until 30 days after the close of all discovery.

The court must view evidence in the light most favorable to the non-moving party.`,
  },
  {
    title: 'Standing — Constitutional Requirement to Sue',
    category: 'definition', source: 'Article III, U.S. Constitution / Lujan v. Defenders of Wildlife', tags: ['standing','jurisdiction','procedure','constitutional'],
    content: `Constitutional standing is the threshold requirement that a plaintiff must satisfy to bring a case in federal court under Article III.

Three requirements (Lujan v. Defenders of Wildlife, 504 U.S. 555):
1. INJURY IN FACT: A concrete and particularized injury, actual or imminent (not speculative)
2. CAUSATION (TRACEABILITY): The injury must be fairly traceable to the defendant's challenged conduct
3. REDRESSABILITY: It must be likely that a favorable court decision will redress the injury

Practical importance: If a defendant challenges standing, the court may dismiss the case for lack of subject-matter jurisdiction even if the underlying claim is meritorious.

Also important:
- A party must have standing at each stage of litigation
- Congress cannot grant standing by statute unless constitutional requirements are met
- Organizational standing: Organizations can sue on behalf of members if members would have standing individually`,
  },
  {
    title: 'Personal Jurisdiction — Court Power Over Defendants',
    category: 'definition', source: 'Due Process / International Shoe Co. v. Washington', tags: ['jurisdiction','procedure','due process'],
    content: `Personal jurisdiction = a court's power over a specific defendant. Without it, any judgment is void.

Types:
1. GENERAL JURISDICTION: Defendant is essentially "at home" in the state (e.g., incorporated there, principal place of business). Goodyear v. Brown (2011), Daimler v. Bauman (2014)

2. SPECIFIC JURISDICTION: Defendant has minimum contacts with the forum state related to the lawsuit. International Shoe Co. v. Washington, 326 U.S. 310 (1945)

International Shoe Test: Due process requires that defendant have "minimum contacts with [the forum state] such that the maintenance of the suit does not offend 'traditional notions of fair play and substantial justice.'"

Factors for specific jurisdiction:
- Defendant purposefully availed itself of forum state
- Claim arises from or relates to those contacts
- Exercise of jurisdiction is reasonable (fair play and substantial justice)

How to challenge: File a Rule 12(b)(2) motion to dismiss for lack of personal jurisdiction — and do it BEFORE answering the complaint, or the defense is waived.`,
  },
  {
    title: 'Statute of Limitations — Time Limits to File Suit',
    category: 'statute', source: 'State and Federal Law (varies)', tags: ['statute of limitations','time','procedure','debt'],
    content: `A statute of limitations is a law that sets the maximum time after an event within which legal proceedings may be initiated. After the period expires, the claim is "time-barred."

DEBT-RELATED LIMITATIONS (vary by state — examples):
- Written contracts: 3-10 years (most states 4-6 years)
- Oral contracts: 2-5 years
- Open accounts (credit cards): Often 3-6 years
- Judgments: 5-20 years (varies; judgments are renewable)
- Federal student loans: No statute of limitations for collection
- IRS tax assessments: Generally 3 years; 6 years if >25% underreported

Key rules:
- The clock usually starts when the debt became delinquent (last payment or charge-off date)
- Making a partial payment MAY restart the clock in some states
- Verbal acknowledgment of the debt may restart the clock in some states
- A debt being past the statute of limitations does NOT erase the debt — it only removes the ability to sue in court
- Debt collectors can still call about time-barred debt (but cannot threaten to sue if they cannot legally do so)
- Credit reporting period is separate: 7 years from delinquency (FCRA) regardless of SOL

FDCPA note: Suing or threatening to sue on a time-barred debt may violate the FDCPA (Kimber v. Federal Financial Corp.).`,
  },
  {
    title: 'Habeas Corpus — Challenge to Unlawful Detention',
    category: 'definition', source: 'U.S. Constitution Art. I Sec. 9 / 28 U.S.C. § 2241', tags: ['habeas corpus','detention','constitutional','liberty'],
    content: `Habeas corpus (Latin: "you shall have the body") is a legal action that requires a person under arrest to be brought before a judge or into court. It is the principal means by which persons held in custody can challenge the legality of their detention.

Constitutional basis: "The Privilege of the Writ of Habeas Corpus shall not be suspended, unless when in Cases of Rebellion or Invasion the public Safety may require it." — U.S. Constitution, Art. I, Sec. 9, Cl. 2

Federal habeas corpus for state prisoners: 28 U.S.C. § 2254 — allows state prisoners to challenge their detention in federal court after exhausting state remedies.

Federal prisoners: 28 U.S.C. § 2255 — federal prisoners challenge their sentence in the sentencing court.

Grounds: Constitutional violations, ineffective assistance of counsel, newly discovered evidence, actual innocence, jurisdictional defects.

AEDPA (Antiterrorism and Effective Death Penalty Act, 1996): Imposed a 1-year statute of limitations on habeas petitions and required "deference" to state court decisions.`,
  },

  // ── Common Law Definitions ─────────────────────────────────────────────
  {
    title: 'Stare Decisis — Precedent in Law',
    category: 'definition', source: "Black's Law Dictionary / Common Law Doctrine", tags: ['common law','precedent','stare decisis'],
    content: `Stare decisis (Latin: "to stand by things decided") is the doctrine by which courts are obligated to follow the precedents set in prior decisions.

Two levels:
1. VERTICAL STARE DECISIS: Lower courts must follow decisions of higher courts within the same jurisdiction (e.g., federal district courts must follow Supreme Court and their Circuit Court of Appeals)
2. HORIZONTAL STARE DECISIS: Courts generally follow their own prior decisions (but can overrule them)

Binding vs. persuasive precedent:
- BINDING (mandatory): Must be followed (higher court in same jurisdiction)
- PERSUASIVE: Courts may consider but are not required to follow (other jurisdictions, lower courts, dissents)

Overruling precedent: Higher courts can overrule prior decisions. The Supreme Court can reverse its own precedents (Dobbs v. Jackson overruled Roe v. Wade; Loper Bright overruled Chevron).

Why it matters: Helps predict how courts will rule and ensures consistent application of law.`,
  },
  {
    title: 'Promissory Estoppel — Enforcing Promises Without a Contract',
    category: 'definition', source: "Restatement (Second) of Contracts § 90 / Black's Law Dictionary", tags: ['estoppel','contract','promise','common law'],
    content: `Promissory estoppel is a doctrine that makes a promise enforceable even without consideration (the normal requirement for a contract) when:

Elements (Restatement Second § 90):
1. The promisor (person making the promise) makes a clear and definite promise
2. The promisor should reasonably expect the promise to induce action or forbearance by the promisee
3. The promisee (person receiving the promise) actually relies on the promise to their detriment
4. Injustice can only be avoided by enforcement of the promise

Remedy: May be limited — courts award what is necessary to prevent injustice (reliance damages), which may be less than full contract damages.

Example: Employer promises employee a pension if they work for 40 years. Employee retires. Employer refuses to pay. Employee may enforce under promissory estoppel even if the promise lacked consideration.

Distinguished from equitable estoppel: Equitable estoppel concerns misrepresentations of existing facts; promissory estoppel concerns promises about future conduct.`,
  },
  {
    title: 'Accord and Satisfaction — Settling a Disputed Debt',
    category: 'definition', source: "UCC § 3-311 / Common Law", tags: ['accord','satisfaction','debt settlement','common law'],
    content: `Accord and satisfaction is a method of discharging a disputed contractual claim in which the parties agree to give and accept a different payment or performance as full satisfaction of the original obligation.

Elements:
1. A bona fide dispute about the debt or obligation
2. An offer by the debtor to settle the dispute (the "accord")
3. Acceptance by the creditor of the settlement (the "satisfaction")
4. Actual performance of the agreed settlement

UCC 3-311 (checks): If a person against whom a claim is asserted proves that the person tendered an instrument to the claimant as full satisfaction of the claim, that the amount of the claim was unliquidated (uncertain) or subject to a bona fide dispute, and that the claimant obtained payment — the claim is discharged.

Practical use: If you write "PAID IN FULL" or "FULL AND FINAL SETTLEMENT" on a check and the creditor cashes it, this may constitute accord and satisfaction of the disputed amount.

WARNING: Creditors sometimes try to avoid this by crossing out the "full payment" notation. Consult state law — many states have specific rules.`,
  },
  {
    title: 'Res Judicata — Claim Preclusion',
    category: 'definition', source: "Common Law / Black's Law Dictionary", tags: ['res judicata','preclusion','finality','procedure'],
    content: `Res judicata (Latin: "a matter judged") is the principle that a final judgment by a court of competent jurisdiction is conclusive upon the parties in any subsequent litigation involving the same cause of action.

Elements:
1. Final judgment on the merits by a court of competent jurisdiction
2. Same parties (or those in privity with them)
3. Same cause of action (same claim or claims that could have been brought)

Effect: Bars re-litigation of all claims that were raised OR COULD HAVE BEEN RAISED in the prior action.

Distinguished from collateral estoppel (issue preclusion):
- Res judicata = same claim, bars entire lawsuit
- Collateral estoppel = same issue, bars re-litigation of specific issues actually decided

Why it matters: If you have a judgment against a debt collector or creditor, they generally cannot sue you again on the same underlying claim. Conversely, if you lose a judgment, you cannot bring the same claims again in a different court.`,
  },

  // ── FDCPA Expanded ─────────────────────────────────────────────────────
  {
    title: 'FDCPA Section 812 — Unfair Practices Prohibited',
    category: 'statute', source: '15 U.S.C. § 1692f', tags: ['fdcpa','unfair practices','debt collector'],
    content: `A debt collector may not use unfair or unconscionable means to collect or attempt to collect any debt. Without limiting the general application of the foregoing, the following conduct is a violation:

(1) Collection of any amount (including any interest, fee, charge, or expense) unless such amount is expressly authorized by the agreement creating the debt or permitted by law.

(2) Acceptance by a debt collector from any person of a check or other payment instrument postdated by more than five days unless such person is notified of intent to deposit the check between 3 and 10 business days before the deposit.

(3) Soliciting any postdated check for the purpose of threatening or instituting criminal prosecution.

(4) Depositing or threatening to deposit any postdated check prior to the date of such check.

(5) Causing charges to be made to any person for communications by concealing the true purpose of the communication.

(6) Taking or threatening to take any nonjudicial action to effect dispossession of property when (A) there is no present right to possession; (B) there is no present intention to take possession; or (C) the property is exempt from such dispossession.

(7) Communicating with a consumer regarding a debt by post card.

(8) Using any language or symbol on any envelope or in the contents of any communication that indicates the communication relates to the collection of a debt.`,
  },
  {
    title: 'FDCPA Section 808 — Harassment or Abuse Prohibited',
    category: 'statute', source: '15 U.S.C. § 1692d', tags: ['fdcpa','harassment','abuse','debt collector'],
    content: `A debt collector may not engage in any conduct the natural consequence of which is to harass, oppress, or abuse any person in connection with the collection of a debt. Without limiting the general application of the foregoing, the following conduct is a violation:

(1) The use or threat of use of violence or other criminal means to harm the physical person, reputation, or property of any person.

(2) The use of obscene or profane language or language the natural consequence of which is to abuse the hearer or reader.

(3) The publication of a list of consumers who allegedly refuse to pay debts, except to a consumer reporting agency.

(4) The advertisement for sale of any debt to coerce payment of the debt.

(5) Causing a telephone to ring or engaging any person in telephone conversation repeatedly or continuously with intent to annoy, abuse, or harass any person at the called number.

(6) Placement of telephone calls without meaningful disclosure of the caller's identity.

YOUR RIGHTS: If a debt collector harasses you, document every contact (date, time, what was said). File complaints with the CFPB (consumerfinance.gov), FTC, and your state Attorney General. You have the right to sue for damages within one year.`,
  },

  // ── Administrative Law ─────────────────────────────────────────────────
  {
    title: 'FOIA — Freedom of Information Act',
    category: 'statute', source: '5 U.S.C. § 552', tags: ['foia','government','transparency','records'],
    content: `The Freedom of Information Act (FOIA) gives any person the right to request access to federal agency records or information. The law is based on the presumption that the government and its activities are public business.

HOW TO USE FOIA:
1. Identify the correct federal agency that has the records
2. Write a FOIA request letter identifying the records sought as specifically as possible
3. Send to the agency's FOIA office
4. Agency must respond within 20 business days (extensions possible)
5. If denied, you can administratively appeal, then sue in federal district court

Nine exemptions (agencies may withhold):
(1) National security / classified
(2) Internal personnel rules and practices
(3) Information exempted by other statutes
(4) Trade secrets and confidential commercial information
(5) Inter-agency or intra-agency memos (deliberative process)
(6) Personal privacy
(7) Law enforcement records (under certain conditions)
(8) Financial institution regulation
(9) Geological and geophysical information

FEE WAIVERS: You can request fee waivers if disclosure is in the public interest and not for commercial use.

State equivalents: All 50 states have their own public records laws for state and local government records.`,
  },

  // ── Templates ──────────────────────────────────────────────────────────
  {
    title: 'Template: Demand for Verification / Debt Dispute Letter — Advanced',
    category: 'template', source: 'Internal Template (FDCPA-Based)', tags: ['template','debt','verification','fdcpa','dispute'],
    content: `[YOUR FULL LEGAL NAME]
[Address]
[City, State, ZIP]
[Date]

Sent Via: CERTIFIED MAIL — Return Receipt Requested
Certificate No.: _______________

[DEBT COLLECTOR / CREDITOR NAME]
[Address]

RE: NOTICE OF DISPUTE AND FORMAL REQUEST FOR DEBT VALIDATION
Alleged Account: [ACCOUNT NUMBER]
Alleged Balance: $[AMOUNT]

TO WHOM IT MAY CONCERN:

This letter constitutes formal written notice that I dispute the alleged debt referenced above in its entirety.

Pursuant to the Fair Debt Collection Practices Act (15 U.S.C. § 1692g), I hereby demand complete validation and verification of this alleged debt. You are hereby notified that pursuant to 15 U.S.C. § 1692g(b), you must CEASE ALL COLLECTION ACTIVITY until you have provided complete validation.

I request the following:
1. Complete chain of assignment of the alleged debt showing all original and intermediate creditors
2. Original signed agreement or contract creating the alleged debt
3. Complete payment history from inception of the account
4. Proof that your company is licensed to collect debts in [STATE]
5. Proof that the statute of limitations has not expired
6. Documentation establishing that you are the current legal owner or authorized agent
7. Itemization of all fees, interest, and charges added to the principal balance
8. Name and address of the original creditor if different from current holder
9. Copy of any judgment if this alleged debt has been reduced to judgment

All rights reserved, UCC 1-308. Without prejudice.

I am aware of my rights under the FDCPA, FCRA, UCC, and applicable state law. Any further collection activity without proper validation, or any attempt to report this disputed debt to a credit bureau without proper notation that it is disputed, may subject your organization to liability under 15 U.S.C. § 1692k.

Sincerely,
[YOUR SIGNATURE]
[PRINTED NAME]
[Date]`,
  },
  {
    title: 'Template: Notice of Conditional Acceptance',
    category: 'template', source: 'Internal Template (Procedural)', tags: ['template','conditional acceptance','dispute','notice'],
    content: `[YOUR FULL LEGAL NAME]
[Address]
[Date]

Sent Via: CERTIFIED MAIL — Return Receipt Requested

[OPPOSING PARTY / CREDITOR / COLLECTOR]
[Address]

RE: NOTICE OF CONDITIONAL ACCEPTANCE OF YOUR CLAIM / OFFER
Reference: [Account/Case/Reference Number]

NOTICE TO PRINCIPAL IS NOTICE TO AGENT. NOTICE TO AGENT IS NOTICE TO PRINCIPAL.

Dear [Name or To Whom It May Concern]:

I have received your correspondence dated [DATE] making a claim/demand in the amount of $[AMOUNT].

I am prepared to accept your claim/offer conditionally upon your providing proof of the following:

CONDITION 1: Provide the original signed agreement evidencing a lawful binding contract between [your name] and [their entity name], including consideration, offer, and acceptance.

CONDITION 2: Provide a complete and accurate accounting showing how the alleged amount was calculated, including all original principal, interest rates applied, fees charged, and any credits applied.

CONDITION 3: Provide proof that your claim is not time-barred under the applicable statute of limitations.

CONDITION 4: Provide proof of your standing and authority to make this claim, including chain of title if the debt was assigned or sold.

CONDITION 5: Provide the law or lawful regulation that requires me to pay this alleged obligation.

Upon your fulfillment of the above conditions, I will consider your claim. Failure to respond with the requested documentation within [30] days of receipt of this notice will be taken as your agreement that no such documentation exists and that your claim is hereby abandoned.

All rights reserved without prejudice, UCC 1-308.

Respectfully,
[YOUR SIGNATURE]
[PRINTED NAME]`,
  },

  // ── Definitions — Black's Law ──────────────────────────────────────────
  {
    title: 'In Rem vs. In Personam Jurisdiction',
    category: 'definition', source: "Black's Law Dictionary / Common Law", tags: ['jurisdiction','in rem','in personam','property'],
    content: `IN PERSONAM (against the person): Jurisdiction over a specific individual or legal entity. Based on the defendant's presence in, domicile in, or contacts with the forum. A judgment in personam is personally binding on the defendant wherever they are.

IN REM (against the thing): Jurisdiction over property located within the court's territorial jurisdiction, regardless of where the property owner lives. A judgment in rem affects only the property — not the person.

QUASI IN REM: Court exercises jurisdiction over property within its territory, but uses it to adjudicate a personal claim against the property owner. Limited to the value of the property.

Practical importance:
- Courts must have either in personam OR in rem jurisdiction to issue a valid judgment
- A default judgment without proper jurisdiction is VOID and can be collaterally attacked at any time
- Asset seizure cases (forfeiture) typically proceed in rem
- Debt collection: Collectors must have personal jurisdiction over you to sue you in court

Key case: Shaffer v. Heitner (1977) — Supreme Court held that in rem jurisdiction must also satisfy the minimum contacts test of International Shoe.`,
  },
  {
    title: 'Laches — Equitable Defense Based on Unreasonable Delay',
    category: 'definition', source: "Equity / Black's Law Dictionary", tags: ['laches','equity','defense','delay'],
    content: `Laches is an equitable defense that bars a claim if the plaintiff unreasonably delayed in bringing the claim and that delay prejudiced the defendant.

Elements:
1. Plaintiff had knowledge of the defendant's actions or of the facts giving rise to the claim
2. Plaintiff unreasonably delayed in asserting the claim
3. The delay caused prejudice to the defendant

Different from statute of limitations:
- Statute of limitations = fixed legal time limit set by statute
- Laches = equitable doctrine applied by courts at their discretion, especially in equity cases
- Laches can apply even before the statute runs, or in cases with no statute of limitations

Where it applies: Primarily in equity cases (injunctions, specific performance, trusts). Less commonly applied in legal cases (damages).

Example: Creditor knows about a debt for 8 years, then sues. Even if within the statute of limitations, defendant may raise laches if the delay caused them to lose evidence or witnesses.`,
  },
  {
    title: 'Mens Rea — Criminal Intent',
    category: 'definition', source: "Criminal Law / Black's Law Dictionary", tags: ['mens rea','criminal law','intent','definition'],
    content: `Mens rea (Latin: "guilty mind") is the mental element of a criminal act — the intent or knowledge of wrongdoing that constitutes part of a crime.

Four levels under the Model Penal Code (MPC):
1. PURPOSE (intentionally): Conscious object to engage in the conduct or cause the result
2. KNOWLEDGE (knowingly): Aware that conduct is of that nature or that circumstances exist; practically certain result will follow
3. RECKLESSNESS (recklessly): Consciously disregards a substantial and unjustifiable risk
4. NEGLIGENCE (negligently): Should have been aware of a substantial and unjustifiable risk (objective standard)

STRICT LIABILITY crimes: No mens rea required (usually regulatory/minor offenses, traffic violations, statutory rape).

Key principle: Criminal law generally requires both a guilty act (actus reus) AND a guilty mind (mens rea) for conviction. No crime without both.

Defenses that negate mens rea:
- Mistake of fact (if genuine, may negate intent)
- Intoxication (involuntary intoxication may be a complete defense)
- Insanity (M'Naghten test, MPC substantial capacity test)
- Diminished capacity (partial defense in some jurisdictions)`,
  },
  {
    title: 'Pro Se — Self-Representation in Court',
    category: 'definition', source: "Common Law / 28 U.S.C. § 1654", tags: ['pro se','self-representation','court','rights'],
    content: `Pro se (Latin: "for oneself") refers to a person who represents themselves in a legal proceeding without the assistance of an attorney.

Legal basis: 28 U.S.C. § 1654 — "In all courts of the United States the parties may plead and conduct their own cases personally or by counsel."

Supreme Court recognition: Faretta v. California (1975) — the Sixth Amendment guarantees the right to self-representation in criminal cases.

Practical considerations for pro se litigants:
- Courts generally hold pro se filings to a less stringent standard than attorney-drafted filings (Haines v. Kerner)
- However, pro se litigants must still comply with procedural rules
- Courts cannot give legal advice to pro se litigants
- Some courts have pro se clinics or legal aid resources

Resources:
- PACER (pacer.gov) — federal court records
- Court's self-help center (if available)
- Legal aid organizations (income-based)
- Law school clinics

Tips:
- Read the court's local rules carefully
- File documents on time
- Serve all parties properly
- Keep copies of everything
- Be respectful and professional in all court filings`,
  },
]

export async function POST() {
  const existing = await supabaseAdmin.from('knowledge').select('title')
  const existingTitles = new Set((existing.data ?? []).map((r: any) => r.title))
  const toInsert = LIBRARY.filter(e => !existingTitles.has(e.title))

  if (toInsert.length === 0) {
    return NextResponse.json({ message: 'All library entries already exist.', added: 0 })
  }

  let added = 0
  for (const entry of toInsert) {
    try {
      const embedding = await embed(`${entry.title}\n${entry.content}`)
      await supabaseAdmin.from('knowledge').insert({ ...entry, embedding })
      added++
    } catch (err) {
      console.error(`Failed to seed "${entry.title}":`, err)
    }
  }

  await logAudit({
    action: 'knowledge_library_seeded',
    details: { added, total_entries: LIBRARY.length },
  })

  return NextResponse.json({
    message: `Added ${added} law library entries.`,
    added,
    categories: ['UCC', 'Constitutional', 'Procedural', 'Common Law', 'FDCPA', 'Administrative', 'Templates'],
  })
}
