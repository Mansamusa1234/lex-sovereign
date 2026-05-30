import { NextResponse } from 'next/server'
import { supabaseAdmin, logAudit } from '@/lib/supabase'
import { embed } from '@/lib/openai'

const STARTER_ENTRIES = [
  {
    title: 'FDCPA Section 809 — Debt Validation Rights',
    category: 'statute',
    source: '15 U.S.C. § 1692g',
    tags: ['fdcpa', 'debt', 'validation', 'consumer rights'],
    content: `Within five days after the initial communication with a consumer in connection with the collection of any debt, a debt collector shall, unless the following information is contained in the initial communication or the consumer has paid the debt, send the consumer a written notice containing:
(1) The amount of the debt;
(2) The name of the creditor to whom the debt is owed;
(3) A statement that unless the consumer, within thirty days after receipt of the notice, disputes the validity of the debt, the debt will be assumed to be valid by the debt collector;
(4) A statement that if the consumer notifies the debt collector in writing within the thirty-day period that the debt is disputed, the debt collector will obtain verification of the debt and mail a copy to the consumer;
(5) A statement that, upon the consumer's written request within the thirty-day period, the debt collector will provide the consumer with the name and address of the original creditor, if different from the current creditor.

If the consumer notifies the debt collector in writing within the 30-day period that the debt is disputed, the debt collector must CEASE COLLECTION ACTIVITY until verification is mailed.`,
  },
  {
    title: 'FDCPA Section 805 — Restrictions on Communication',
    category: 'statute',
    source: '15 U.S.C. § 1692c',
    tags: ['fdcpa', 'debt', 'communication', 'harassment'],
    content: `Without prior consent given directly to the debt collector or the express permission of a court of competent jurisdiction, a debt collector may not communicate with a consumer:
(1) at any unusual time or place or at a time or place known to be inconvenient to the consumer. In the absence of knowledge of circumstances to the contrary, debt collectors shall assume that convenient times for communicating are after 8 a.m. and before 9 p.m., local time at the consumer's location;
(2) if the debt collector knows the consumer is represented by an attorney with respect to such debt and has knowledge of, or can readily ascertain, such attorney's name and address — must communicate with the attorney only;
(3) at the consumer's place of employment if the debt collector knows or has reason to know that the consumer's employer prohibits the consumer from receiving such communication.

A consumer may notify the debt collector in writing that they refuse to pay the debt or wish the debt collector to cease further communication. Upon receipt of such notice, the debt collector must cease communication except: to advise the consumer that further efforts are being terminated, to notify about possible remedies, or to notify of an intended remedy.`,
  },
  {
    title: 'FDCPA Section 807 — False or Misleading Representations Prohibited',
    category: 'statute',
    source: '15 U.S.C. § 1692e',
    tags: ['fdcpa', 'debt', 'misrepresentation', 'false claims'],
    content: `A debt collector may not use any false, deceptive, or misleading representation or means in connection with the collection of any debt. Prohibited representations include:
(1) The false representation of the character, amount, or legal status of any debt;
(2) Falsely representing themselves as attorneys or government representatives;
(3) The false representation that the consumer committed a crime;
(4) Threatening to take action that cannot legally be taken or that is not intended to be taken;
(5) Using unfair or unconscionable means to collect a debt;
(6) Failing to disclose in the initial communication that the debt collector is attempting to collect a debt and that any information obtained will be used for that purpose.

Penalty: Violation of the FDCPA allows the consumer to sue in federal or state court within one year of the violation for actual damages, up to $1,000 in additional damages, plus attorney's fees and costs.`,
  },
  {
    title: 'FCRA Section 609 — Right to Request Credit File Disclosure',
    category: 'statute',
    source: '15 U.S.C. § 1681g',
    tags: ['fcra', 'credit', 'disclosure', 'credit bureau'],
    content: `Every consumer reporting agency shall, upon request and proper identification of any consumer, clearly and accurately disclose to the consumer:
(1) All information in the consumer's file at the time of the request;
(2) The sources of the information;
(3) Identifying information for each person that has procured a consumer report for employment purposes within 2 years, or for any other purpose within 1 year;
(4) The dates, original payees, and amounts of any checks drawn on the consumer's checking or savings accounts which are on file.

Consumers are entitled to one free disclosure per 12-month period. A consumer reporting agency must provide the disclosure within 15 days of receiving a written request. Disputes regarding inaccurate information must be investigated within 30 days.`,
  },
  {
    title: 'Template: Debt Validation Request Letter',
    category: 'template',
    source: 'Internal Template',
    tags: ['template', 'debt', 'validation', 'letter'],
    content: `[YOUR FULL LEGAL NAME]
[Your Address]
[City, State, ZIP]
[Date]

[Debt Collector Name]
[Debt Collector Address]

RE: Account Number [ACCOUNT NUMBER] — NOTICE OF DISPUTE AND REQUEST FOR VALIDATION

To Whom It May Concern:

I am writing in response to your [letter/phone call/notice] dated [DATE] regarding the alleged debt referenced above.

Pursuant to 15 U.S.C. § 1692g of the Fair Debt Collection Practices Act (FDCPA), I hereby formally dispute this debt and request complete validation of the debt. Please provide:

1. The original signed agreement creating this alleged debt;
2. Complete payment history showing how the current balance was calculated;
3. The name and address of the original creditor;
4. Proof that your company is licensed to collect debts in [STATE];
5. The date the alleged debt was charged off;
6. Chain of title showing all assignments of the alleged debt.

Please be advised: pursuant to 15 U.S.C. § 1692g(b), you must cease all collection activity until you have provided complete validation of this debt.

This is NOT a refusal to pay, but a request for proper validation before any payment is considered.

This letter is being sent via [CERTIFIED MAIL / RETURN RECEIPT REQUESTED].

All future correspondence must be in writing only.

Sincerely,
[YOUR SIGNATURE]
[YOUR PRINTED NAME]`,
  },
  {
    title: 'Template: Cease and Desist Letter to Debt Collector',
    category: 'template',
    source: 'Internal Template',
    tags: ['template', 'cease and desist', 'debt', 'fdcpa'],
    content: `[YOUR FULL LEGAL NAME]
[Your Address]
[City, State, ZIP]
[Date]

[Debt Collector Name]
[Debt Collector Address]

RE: CEASE AND DESIST — Account [ACCOUNT NUMBER IF KNOWN]

To Whom It May Concern:

Pursuant to my rights under 15 U.S.C. § 1692c(c) of the Fair Debt Collection Practices Act, I hereby demand that you IMMEDIATELY CEASE AND DESIST all communication with me regarding the above-referenced account.

This notice serves as formal written notification that:
1. I am invoking my right under the FDCPA to have you cease all further communication;
2. Any further contact by your company may constitute a violation of federal law;
3. I reserve all rights without prejudice under UCC 1-308.

Should you continue to contact me after receiving this notice, I will file complaints with:
— The Consumer Financial Protection Bureau (CFPB)
— The Federal Trade Commission (FTC)
— The [STATE] Attorney General's Office
— And pursue all available legal remedies under the FDCPA

Send all future correspondence in writing only to the address above.

Without prejudice, UCC 1-308,
[YOUR SIGNATURE]
[YOUR PRINTED NAME]

Sent via: Certified Mail — Return Receipt Requested
Certificate No.: [USPS TRACKING NUMBER]`,
  },
  {
    title: 'Definition: Estoppel',
    category: 'definition',
    source: "Black's Law Dictionary, 11th Edition",
    tags: ['definition', 'estoppel', 'equity', "black's law"],
    content: `Estoppel (noun): A bar that prevents one from asserting a claim or right that contradicts what one has said or done before, or what has been legally established as true.

Types:
— Equitable Estoppel (Estoppel in Pais): A party who has by statement or conduct caused another to believe a certain state of things to be true, and has induced such party to act upon that belief so as to alter their condition to their detriment, may not deny the truth of that state of affairs.

— Promissory Estoppel: A promise is enforceable even without consideration if the promisor reasonably should have expected the promise to induce action by the promisee, and the promisee actually relied on the promise to their detriment.

— Judicial Estoppel: A party who has successfully maintained a position in one legal proceeding may not maintain an inconsistent position in a subsequent proceeding.

— Collateral Estoppel (Issue Preclusion): Once a court decides an issue of fact or law necessary to its judgment, that decision prevents the same parties from relitigating the issue in future litigation.

Practical Use: If a creditor or collector has represented something to be true (e.g., a balance, a status, a deadline), and you relied on that representation to your detriment, you may be able to invoke estoppel to prevent them from contradicting that representation.`,
  },
  {
    title: 'Definition: Void Ab Initio',
    category: 'definition',
    source: "Black's Law Dictionary, 11th Edition",
    tags: ['definition', 'void', 'contract', "black's law"],
    content: `Void Ab Initio (Latin: "void from the beginning"): A transaction or act that is null and has no legal effect from its inception, as though it never occurred. Distinguished from "voidable," which describes a transaction that may be affirmed or rejected at the option of one of the parties.

A contract or instrument that is void ab initio cannot be ratified or made valid by subsequent conduct of the parties. Examples of situations that may render an agreement void ab initio include:
— Fraud in the factum (misrepresentation about the nature of the instrument itself)
— Lack of legal capacity at the time of signing
— Illegality of the contract's subject matter
— Absence of mutual assent

Practical Use: If a debt instrument was created through fraud, misrepresentation, or without lawful authority, it may be argued to be void ab initio and unenforceable.`,
  },
  {
    title: 'Definition: Surety and Suretyship',
    category: 'definition',
    source: "Black's Law Dictionary, 11th Edition",
    tags: ['definition', 'surety', 'guarantee', "black's law"],
    content: `Surety (noun): A person who is primarily liable for the payment of another's debt or the performance of another's obligation. Distinguished from a guarantor, who is only secondarily liable.

Suretyship: A contractual relationship in which one party (the surety) agrees to be responsible for the debt, default, or failure in duty of a second party (the principal).

Key distinctions:
— A surety's obligation is co-extensive with the principal's obligation
— A surety can be held liable without first pursuing the principal
— A surety has rights of subrogation against the principal after payment

Practical relevance: Understanding whether you are a principal or a surety in any financial agreement is important for determining your actual legal obligations and defenses.`,
  },
  {
    title: 'UCC 1-308 — Performance or Acceptance Under Reservation of Rights',
    category: 'statute',
    source: 'Uniform Commercial Code § 1-308',
    tags: ['ucc', 'reservation of rights', 'commercial law'],
    content: `A party that with explicit reservation of rights performs or promises performance or assents to performance in a manner demanded or offered by the other party does not thereby prejudice the rights reserved. Such words as "without prejudice," "under protest," or the like are sufficient.

Effect: If you sign or accept a document "under protest" or "without prejudice, UCC 1-308," you are signaling that your compliance does not constitute agreement with the other party's characterization of the situation, and you preserve any legal defenses or objections.

Important note: This section does NOT operate as a blanket protection against all legal obligations. It is a tool within commercial transactions to preserve the right to dispute while complying. Misuse of UCC 1-308 in consumer contexts (e.g., refusing to pay taxes) has been consistently rejected by courts. Always consult an attorney about the proper application of this provision.`,
  },
  {
    title: '5th Amendment — Right Against Self-Incrimination',
    category: 'statute',
    source: 'U.S. Constitution, Amendment V',
    tags: ['constitution', '5th amendment', 'self-incrimination', 'rights'],
    content: `"No person shall be held to answer for a capital, or otherwise infamous crime, unless on a presentment or indictment of a Grand Jury, except in cases arising in the land or naval forces, or in the Militia, when in actual service in time of War or public danger; nor shall any person be subject for the same offence to be twice put in jeopardy of life or limb; nor shall be compelled in any criminal case to be a witness against himself, nor be deprived of life, liberty, or property, without due process of law; nor shall private property be taken for public use, without just compensation."

Key rights:
1. Grand jury indictment for serious federal crimes
2. Protection against double jeopardy
3. Right to remain silent / not self-incriminate
4. Due process before deprivation of life, liberty, or property
5. Just compensation for government takings (Takings Clause)

The right against self-incrimination applies in any proceeding — civil or criminal — where answers might tend to incriminate in a criminal proceeding.`,
  },
  {
    title: 'FDCPA Section 813 — Civil Liability',
    category: 'statute',
    source: '15 U.S.C. § 1692k',
    tags: ['fdcpa', 'liability', 'damages', 'lawsuit'],
    content: `Except as otherwise provided by this section, any debt collector who fails to comply with any provision of the FDCPA with respect to any person is liable to such person in an amount equal to the sum of:

(1) Any actual damage sustained by such person as a result of such failure;
(2)(A) In the case of any action by an individual, such additional damages as the court may allow, but not exceeding $1,000;
(2)(B) In the case of a class action, such amount as the court may allow for all other class members, without regard to minimum individual recovery, not to exceed the lesser of $500,000 or 1 per centum of the net worth of the debt collector;
(3) In the case of any successful action to enforce the foregoing liability, the costs of the action, together with a reasonable attorney's fee as determined by the court.

In determining the amount of liability in any action, the court shall consider, among other relevant factors: the frequency and persistence of noncompliance, the nature of such noncompliance, and the extent to which such noncompliance was intentional.

Statute of limitations: Actions must be brought within ONE YEAR from the date on which the violation occurs.`,
  },
]

export async function POST() {
  const existing = await supabaseAdmin
    .from('knowledge')
    .select('title')

  const existingTitles = new Set((existing.data ?? []).map((r: any) => r.title))
  const toInsert = STARTER_ENTRIES.filter(e => !existingTitles.has(e.title))

  if (toInsert.length === 0) {
    return NextResponse.json({ message: 'All starter entries already exist.', added: 0 })
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
    action: 'knowledge_seeded',
    details: { added, total_starter_entries: STARTER_ENTRIES.length },
  })

  return NextResponse.json({ message: `Added ${added} starter knowledge entries.`, added })
}
