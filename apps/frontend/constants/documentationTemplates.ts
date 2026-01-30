import { marked } from 'marked';

export type TemplateType =
  | 'empty'
  | 'vulnerability-report'
  | 'incident-report'
  | 'cra-conformity-guide';

interface DocumentationTemplate {
  id: TemplateType;
  name: string;
  markdown: string;
}

const INCIDENT_REPORT_MD = `**Template for incident report**
   
**General information**

***Company***
 
 _Hint: Address details of the company reporting the incident._

| Field         | Value                   |
|:--------------|:-----------------------|
| Company name  |  |
| State         |  |
| Town          |  |
| Address       |  |
 

***Reporter***

_Hint: Details of the person reporting the incident._

| Field         | Value                   |
| :---- | :---- |
| Name |   |
| Position/Function |   |
| e-mail |   |
| Phone |   |

 

***Incident Commander***

_Hint: Details of the incident commander._
| Field         | Value                   |
| :---- | :---- |
| Name |   |
| Position/Function |   |
| e-mail |   |
| Phone |   |

   
 

**Incident details**  
Hint: Detailed information about incident.

| Incident description |   |
| :---- | :---- |
| Classification | [] Critical <br> [] High <br>  [] Medium <br> [] Low N/A <br> [] False Positive |
| Timeline & Key Dates Occurrence Time: [Date Picker] (Est. start of the event) <br>  Detection Time: [Date Picker] (When you found out)   | Date/Time of Occurrence: The estimated timestamp when the incident actually started (based on logs or evidence). <br>  Date/Time of Detection: The exact timestamp when the organization became aware of the incident.<br> Note: This starts the regulatory clock for mandatory notifications (e.g., 24-hour Early Warning). <br>  Date/Time of Reporting: When the incident was officially logged in the system.  <br> Date/Time of Closure: When the incident was resolved and the ticket closed.   Total Downtime: (Optional/Auto-calculated) Duration of service unavailability. |
| Affected Components/Assets |   |
| Detection Method: How was the incident discovered? Options: Automated Alert (SIEM/IDS), Internal User Report, External Notification (Customer/Researcher), Audit/Review.   |   |
| Regulatory Reporting Required? (Yes/No) – Does this incident meet the threshold for notification to authorities (CSIRT/ENSIA)? |   |
| Incident Status | [] New: The incident has been logged but is not yet assigned or analyzed. <br> [] Under Investigation: The team is actively analyzingthe root cause, scope, and severity of the event. <br> [] In Progress: Containment measures are being executed to stop the threat from spreading. <br> [] In Remediation: Long-term fixes (patches, configuration changes) are being applied to resolve the root cause. <br> [] Monitoring: The system is under observation to ensure stability and prevent recurrence after the fix. <br> [] Resolved: Technical issues are fixed and services are restored, pending final documentation. <br> [] Closed: All post-incident activities, including reporting and lessons learned, are completed. <br> [] False Positive: Investigation confirmed the event was not a security incident; no further action required. <br> [] On Hold: Resolution is temporarily paused awaiting external input (e.g., vendor patch, legal advice). |

   
   
   
   
**Incident type**  
Hint: Select all applicable types of incident.

|   | Incident type |
| :---- | :---- |
| []  | General |
| [] | Confidentiality |
| [] | Integrity |
| [] | Availability |
| [] | Access control |
| [] | Vulnerabilities |
| []  | Technical failure |
| [] | Theft or loss equipment |

   
**Attack type**  
Hint: Select all applicable types of attacks.

|   | Attack type |
| :---- | :---- |
| [] | Denial of service |
| [] | Unauthorized access |
| [] | Malware |
| [] | Abuse |
| [] | Others |

   
   
**Impact Assessment**  
**1. Affected Jurisdictions**

* **Field Type:** Multi-select Dropdown  
* **Options:** List of EU Member States, Non-EU/Global.  
* **Tooltip:** Select the specific countries or regions where service disruption, data breach, or operational failure is currently occurring.

**2. Estimated User Impact**

* **Field Type**: Single Select (Range)  
* **Options:**  
* < 100 (Minor / Localized)  
* 100 – 1,000 (Substantial)  
* 1,001 – 100,000 (Significant)  
* 100,001 – 1,000,000 (Major)  
* 1,000,000 (Critical / Mass Event)  
* **Tooltip:** Estimate the number of end-users experiencing service unavailability, performance degradation, or data compromise.

**3. Affected Device Volume**

* **Field Type:** Numeric / Percentage  
* **Tooltip:** Indicate the total number of devices (or percentage of the fleet) that are offline, infected, or malfunctioning due to the incident.

**Treatment details (part 1)**

***Corrective action***

_Hint: Describe the actions that will mitigate and minimalize their impact on the future incident._

| No | Description |
| ----- | ----- |
| 1 |   |
| 2 |   |
| 3 |   |
| 4 |   |
| 5 |   |

 
***Root cause***

_Hint: Describe the root cause of the incident._

| No | Description |
| ----- | ----- |
| 1 |   |
| 2 |   |
| 3 |   |
| 4 |   |
| 5 |   |

   
   
**Treatment details (part 2)**

***Scope***

_Hint: What is the scope for the future treatment of such incident recurrence._

| No | Description |
| ----- | ----- |
| 1 |   |
| 2 |   |
| 3 |   |
| 4 |   |
| 5 |   |

 
***Preventive action***

_Hint: List the actions that the organization is taking to prevent such incident in near future._
| No | Description |
| ----- | ----- |
| 1 |   |
| 2 |   |
| 3 |   |
| 4 |   |
| 5 |   |
`;

const VULNERABILITY_REPORT_MD = `**Template for Vulnerability report**  
   
**General information**

***Company***

_Hint: Address details of the company reporting the vulnerability._
| Field         | Value                   |
| :---- | :---- |
| Company name |   |
| State |   |
| Town |   |
| Address |   |

 

***Reporter***

_Hint: Details of the person reporting the vulnerability.__

| Field         | Value                   |
| :---- | :---- |
| Name |   |
| Position/Function |   |
| e-mail |   |
| Phone |   |

 

**General Vulnerability Information**

* **Vulnerability Title:** A short, descriptive name (e.g., "Buffer Overflow in Login Module").  
* **Vulnerability Source:** Where did the report come from?  
* *Options*: Internal Audit, Pentest, External Researcher (CVD), Automated Scan, Public CVE.  
* **External Reference (CVE/Advisory ID):** If the vulnerability already has a public identifier (e.g., CVE-2024-12345), it must be logged here.

 

**Assessment & Severity (Risk Level)**

* **CVSS Score (Base Score):** The numerical score (0.0 - 10.0) based on the Common Vulnerability Scoring System.  
* **CVSS Vector String:** The textual representation of the metric (e.g., CVSS:3.1/AV:N/AC:L...). 

 

**Impact & Scope Assessment**  
**1. Affected Jurisdictions**

* **Field Type:** Multi-select Dropdown  
* **Options:** List of EU Member States, Non-EU/Global.  
* **Tooltip:** Select the specific countries or regions where the affected devices are deployed or where users are impacted.

**2. Estimated User Impact**

* **Field Type:** Single Select (Range)  
* **Options:**  
* < 100 (Limited / Testing)  
* 100 – 1,000 (Local Scale)  
* 1,001 – 100,000 (Significant)  
* 100,001 – 1,000,000 (Major)  
* > 1,000,000 (Critical / Mass Scale)  
* **Tooltip:** Provide a rough estimate of the number of end-users or customers potentially exposed to this vulnerability.

**3. Affected Device Volume**

* **Field Type:** Numeric / Percentage  
* **Tooltip:** Indicate the total number of units (or the percentage of the active fleet) currently running the vulnerable version.  
   

**Stage**

- [ ] Early Warning (24h)  
- [ ] Vulnerability Notification (72h)  
- [ ] Final Report (14d)

 
**Vulnerability Scope – Early Warning (24h)**

| Field         | Value                   |
| :---- | :---- |
| EU member states that are affected (where the product has been made available) |   |
| Date (when observed) |   |

 

**Vulnerability General Information - Vulnerability Notification (72h)**

| Field         | Value                   |
| :---- | :---- |
| Vulnerability description – general information about the vulnerability and general nature of its exploitation |   |
| Products affected – general information about affected software/hardware |   |

 

**Corrective/Mitigating measures taken Vulnerability Notification (72h)**

***Corrective/Mitigating measures***
  
_Hint: Describe the actions that were taken to mitigate and minimize the impact of the vulnerability_
| No | Description |
| ----- | ----- |
| 1 |   |
| 2 |   |
| 3 |   |
| 4 |   |
| 5 |   |

 

**Corrective/Mitigating measures users can take Vulnerability Notification (72h)**

***Corrective/Mitigating measures***  

_Hint: Describe the actions that users can take to mitigate and minimize the impact of the vulnerability_
| No | Description |
| ----- | ----- |
| 1 |   |
| 2 |   |
| 3 |   |
| 4 |   |
| 5 |   |

 

**Vulnerability details Final Report (14d)**  

_Hint: Detailed information about vulnerability._

***Vulnerability description – short description***


| Field         | Value                   |
| :---- | :---- |
| Vulnerability details – additional context helping to reproduce the problem and description of its consequences (severity) and impact |   |
| URL address/software name version and affected components/device model and identifier |   |
| Malicious actors that exploited/are exploiting the vulnerability |   |

 

**Vulnerability Remediation Final Report (14d)**

***Security updates/Corrective measures*** 

_Hint: Describe security update or other corrective measures that have been made available to remedy the vulnerability_ 
| No | Description |
| ----- | ----- |
| 1 |   |
| 2 |   |
| 3 |   |
| 4 |   |
| 5 |   |

 

**Vulnerability Status** 

- [ ]   New / Triage: Just reported, waiting for validation.  
- [ ]  Confirmed: Validated as a real vulnerability; awaiting scheduling.  
- [ ] In Remediation: Developers are working on the fix/patch.  
- [ ] Fix Available: Patch is ready but not yet deployed/released.  
- [ ] Mitigated: A temporary workaround is in place (e.g., WAF rule), but the root cause exists.  
- [ ] Closed (Fixed): The patch is deployed and verified.  
- [ ] Accepted Risk: The business decided not to fix it (requires justification/sign-off).  
- [ ] False Positive: Analysis showed it is not a vulnerability.

 

**Timeline**

* Discovery Date: When was the vulnerability first identified?  
* Remediation Target Date: When is the fix due?  
* Resolution Date: When was the fix verified and closed?
`;

const CRA_CONFORMITY_GUIDE_MD = `**CRA Conformity Assessment Guide**

for manufacturers of products with digital elements

 

***What is conformity assessment under the CRA?***

Under the Cyber Resilience Act (CRA), conformity assessment is the set of procedures a manufacturer uses to demonstrate that a product with digital elements and the manufacturer's processes meet the essential cybersecurity requirements (Annex I), so the product can be CE-marked and placed on the EU market. CRA conformity assessment procedures are built on the New Legislative Framework (Decision 768/2008/EC) and are designed to verify both **product** and **process requirements** across the product lifecycle (planning, design, development/production, testing and maintenance).  
   
The CRA's Annex VIII defines the procedures themselves (Modules A, B, C, H), what the manufacturer must do, and when/notified bodies (third-party conformity assessment bodies designated by Member States) must be involved. CE marking and the EU Declaration of Conformity follow successful assessment and must be kept at the authorities' disposal.  
   
The Blue Guide on the implementation of EU product rules (2022/C 247/01) explains the general principles that apply across EU product laws: what conformity assessment is, the modular structure of procedures, the roles of manufacturers and notified bodies, and the risk-based rationale for selecting procedures. In short, modules range from lighter, self-assessment options to more comprehensive, third-party and quality-system-based options, and the choice must be proportionate to product risks, design complexity, and production mode.  
 

***What compliance procedures are available for products with digital elements?***

CRA Article 32 and **Annex VIII** make the following procedures available:  
   
****Module A — Internal control (manufacturer self-assessment)****
The manufacturer ensures and declares, on its sole responsibility, that the product and the manufacturer's processes meet the CRA's essential requirements. No notified body is involved.  
   
****Module B — EU-type examination (design/type)****  
A **notified body** examines the technical design and development (and, where relevant, specimens of critical parts) and issues an **EU-type examination certificate** if the type meets the essential requirements.  
   
****Module C — Conformity to type based on internal production control (production).****.  
After Module B, the manufacturer controls production to ensure **all units conform to the approved type**; no notified body is involved in this phase.  
   
****Module H — Conformity based on full quality assurance (company process certification)****  
A **notified body** assesses and surveys a **manufacturer's quality management system (QMS)** covering design, development, final product inspection/testing, and vulnerability handling across the support period. Products designed and produced under the approved QMS can be CE-marked.  
   
Note: *Manufacturers may also use an applicable **European cybersecurity certification scheme** where available.* 

***How to choose the most appropriate procedure (decision guide)***

**First Distinction**: *Product Certification* vs. *Company Process Certification*

When approaching conformity assessment under the CRA, ask yourself:

*Product Certification Path (**Module B + C**):* 

* **Focuses on the product itself**. A notified body checks whether a representative specimen (design/type) meets CRA requirements (Module B), then the manufacturer ensures that all units produced match the approved type (Module C).  
* Best for manufacturers with specific models or limited ranges, especially if no comprehensive cybersecurity QMS is in place.

*Company Process Certification Path (**Module H**):* 

* **Focuses on the manufacturer's processes.** A notified body audits and certifies your full quality management system (QMS) to ensure it consistently delivers compliant products.  
* Best for manufacturers with broad product portfolios, frequent updates, or those already running mature QMS (ISO 9001, ISO 27001, etc.).


***A. Start from CRA classification & legal triggers***

Use Article 32 to determine what is allowed or required for your product category:

* **General products (not "important" or "critical")**  
   You may use **Module A** by default. You may voluntarily choose B+C, H, or (where available) an EU cybersecurity certification scheme.  
* **Important products – Class I (Annex III)**  
   If you **fully apply** the identified harmonised standards/common specifications or an EU cybersecurity certification scheme at assurance level at least "substantial", you may still use Module A.  
   If you **do not apply** them (or only partly, or they do not exist), you **must** use **B+C** or **H**.  
* **Important products – Class II (Annex III)**  
   Conformity assessment **must involve a third party**: choose **B+C**, **H**, or an applicable EU cybersecurity certification scheme (assurance ≥ "substantial").  
* **Critical products (Annex IV)**  
   Use a **European cybersecurity certification scheme** in accordance with **Article 8(1)**. If the Article 8(1) conditions are **not** met, use any of the options for Important Class II (i.e., **B+C or H**).  
* **Products qualifying as Free and Open-Source Software (FOSS) in Annex III categories**  
   May use the procedures in paragraph 1 (Module A, B+C, H, or certification scheme) **provided the technical documentation is made public at placement on the market**.

**Tip (standards):** Applying OJEU-cited harmonised standards gives **presumption of conformity** for covered requirements; where only a partial fit exists, supplement with other technical solutions and document equivalence. (Blue Guide, Section 4.1.2.)  
 

***B. Use the Blue Guide's risk-based rationale to pick the module***

* **Low risk/complexity & robust internal testing** → Module **A** (self-assessment).  
* **Mass production based on a representative design/type** → **B+C** (type approval + manufacturer-controlled production conformity).  
* **Higher risk/complexity or desire for scalable, portfolio-wide assurance** → **H** (full QMS assessed by a notified body).


**Practical chooser (step-by-step)**

1. **Classify the product** (general / Important Class I / Important Class II / Critical). Apply the legal triggers above.  
2. **Check standards/certification scheme availability** (OJEU-cited harmonised standards, common specifications, or an EU cybersecurity certification scheme at assurance ≥ "substantial"). Your choice of **self-assessment** vs. **third-party assessment** often hinges here (especially for Important Class I).  
3. **Decide product vs. process focus:**  
* **Few models, stable designs** → **Module** **B+C** (product certification path).  
* **Many variants, frequent updates, mature QMS** → **Module** **H** (process certification path).  
4. **Prepare evidence & documentation** per Annex VII/VIII (risk assessment, testing, vulnerability handling, SBOM where applicable, declaration of conformity). Then **CE-mark** and retain records for the required period.  
5. **Maintain conformity with CRA**:   
* under **H**, expect surveillance;   
* under **B+C**, re-assess **Module B** if the approved type changes significantly;   
* under **A**, keep documentation current and reflect the actual integration/environment.

   
*Note: Applying OJEU-cited harmonised standards gives presumption of conformity for covered requirements; where only a partial fit exists, supplement with other technical solutions and document equivalence. (Blue Guide, Section 4.1.2.)*

**Modules in Detail**

***Module A — Internal control (manufacturer self-assessment)***

*What it is*: 

* The manufacturer ensures and declares, on its sole responsibility, that the product and the manufacturer's processes meet the CRA's essential requirements. No notified body is involved.

*What you must do:*

* Compile full technical documentation (Annex VII), including risk assessment, design info, testing and vulnerability handling evidence.  
* Ensure design, development, production and vulnerability handling processes achieve compliance and are monitored.  
* Draw up the EU Declaration of Conformity and affix CE marking before placing on the market; keep the documentation for the required retention period.  
* Blue Guide context: A light module used where risks/complexity are low, and the manufacturer can perform all checks internally.

*Output:* 

* *Self-declaration of conformity*

   
   
***Module B: EU-Type Examination***

*What it is*: 

* A notified body examines a specimen (prototype or representative design) of your product with digital elements and verifies it against the CRA's essential cybersecurity requirements.

*What you must do:*

* Prepare technical documentation: risk assessment, design description, SBOM, vulnerability handling measures, test reports.  
* Submit the representative product to a notified body.  
* Cooperate with testing/assessments (can include penetration tests, security configuration checks).  
* Receive an EU-type examination certificate, valid for the approved design.

*Output:* 

* A certificate confirming that the examined type complies.

*Limitation:* 

* Covers only the tested design; if you significantly change the product, you may need a new Module B assessment.

   
***Module C: Conformity to Type (Internal Production Control)*** 

*What it is:*

* The manufacturer ensures that series production conforms to the type approved under Module B. No notified body involvement at this stage.

*What you need to do:*

* Implement internal production control procedures (testing, inspections).  
* Ensure consistency with the type certified under Module B.  
* Keep records: test logs, quality checks, update history.  
* Draw up the EU Declaration of Conformity and affix the CE marking.

*Output:* 

* CE-marked products, with traceable documentation.

   
***Module H: Conformity Based on Full Quality Assurance***

*What it is:*

* A notified body assesses and certifies the manufacturer's quality management system (QMS) covering design, development, production, testing, and cybersecurity maintenance.

*What you need to do:*

* Set up a QMS: must include secure SDLC processes, vulnerability handling, patch management, supplier controls, incident response.  
* Document QMS procedures (align with ISO 9001 for structure, integrate CRA-specific security elements).  
* Undergo a notified body audit (initial assessment of your processes).  
* Ongoing surveillance audits by the notified body to confirm continued compliance.  
* Keep technical documentation available for each product covered under the QMS.

*Output:* 

* Approval of the QMS + CE marking for all products designed and produced under it.

*Advantage*: 

* Easier to bring new products/variants to market without repeating Module B every time.

   
   
**Practical Guidance: Choosing the Right Module**

To determine the most appropriate conformity assessment procedure for your product, please answer the following questions:  

***1. Organizational Setup & Maturity***

* **Question:** Does your organization currently operate a certified Quality Management System (e.g., ISO 9001, ISO 27001)?  
* **Guidance:**  
* **YES:** **Module H (Full Quality Assurance)** is likely the most efficient path, as it allows you to integrate CRA requirements into your existing certified processes.  
* **NO:** If you lack a comprehensive QMS, **Module B+C (EU-Type Examination)** is more practical, as it focuses on certifying the specific product rather than your entire organizational process.  
* **Question:** Do you have the internal resources to maintain continuous surveillance audits and a dedicated cybersecurity QMS?  
* **Guidance:**  
* **YES:** **Module H** is suitable if you are prepared for periodic audits of your processes by a Notified Body.  
* **NO:** **Module B+C** is preferable if you want to limit organizational overhead and engage a Notified Body only once per product design.

***2. Product Strategy & Lifecycle***

* **Question:** What is the anticipated frequency of updates and design changes for the product?  
* **Guidance:**  
* **Stable Designs:** If the product design is stable and updates are infrequent, **Module B+C** is recommended.  
* **Continuous Innovation:** If the product requires frequent updates or continuous feature integration (CI/CD), **Module H** is preferable. It avoids the need for a new Module B assessment for every significant change.  
* **Question:** What is the size and diversity of your product portfolio?  
* **Guidance:**  
* **Broad Portfolio:** If you manage many different product variants or lines, **Module H** offers a scalable "process certification" that covers all products designed under that system.  
* **Limited Range:** If you manufacture only a few specific models, **Module B+C** is more cost-effective as it targets specific "types" without requiring a full system audit.

***3. Market Expectations & Criticality***

* **Question:** What are the specific compliance expectations of your target market or clients?  
* **Guidance:**  
* **Critical Sectors:** If targeting buyers in critical infrastructure sectors who prioritize organizational maturity and supply chain security, **Module H** is strongly advised.  
* **Consumer Market:** For standard consumer devices where price and speed-to-market are key, **Module B+C** is typically sufficient.

**4. Risk & Complexity (General Assessment)**

* **Question:** Is your product classified as "Important Class I" and do you fully apply harmonised standards?  
* **Guidance:**  
* **YES:** You may be eligible for **Module A (Internal Control)**, avoiding third-party involvement entirely.  
* **NO (or Partial Application):** You must choose between **Module B+C** or **Module H**, as third-party assessment becomes mandatory.

   
**What Compliance Requires**

Under B+C:

* Engage a notified body once (design/type).  
* Maintain strong internal controls for consistent production.  
* Update certification when designs change substantially.

Under H:

* Build a comprehensive cybersecurity-focused QMS.  
* Accept periodic notified body audits.  
* Ensure every product under your QMS complies automatically.

   
**Annex: "What do I actually do?" (per module, condensed)**

* **Module A (Internal control)**  
   Build/operate compliant design-to-support processes; compile Annex VII tech file; DoC; CE mark; keep docs. **No notified body.**  
* **Module B + C (Type + production)**  
   **B:** Submit design/specimens to a notified body → obtain EU-type certificate.  
   **C:** Control production internally to match the approved type; DoC; CE mark; keep records. **Notified body in B only.**  
* **Module H (Full quality assurance)**  
   Implement CRA-ready QMS (design→support + vulnerability handling); apply to notified body for QMS assessment; undergo surveillance; DoC; **CE + NB ID**. **Notified body for QMS**.

   
   
**Sources used**

* **CRA**: OJ L 20.11.2024, Annex VIII (Modules A, B, C, H), Article 32 (procedure choices by class), CE-marking/DoCrules.  
* **Blue Guide (2022)**: Section 5 (conformity assessment: definition, modular structure, rationale; roles of notified bodies; overview of modules; risk-based selection); Section 4.1.2 (presumption of conformity via harmonised standards).
`;

const TEMPLATES_RAW: Record<TemplateType, DocumentationTemplate> = {
  'empty': {
    id: 'empty',
    name: 'Empty Document',
    markdown: '',
  },
  'incident-report': {
    id: 'incident-report',
    name: 'Incident Report',
    markdown: INCIDENT_REPORT_MD,
  },
  'vulnerability-report': {
    id: 'vulnerability-report',
    name: 'Vulnerability Report',
    markdown: VULNERABILITY_REPORT_MD,
  },
  'cra-conformity-guide': {
    id: 'cra-conformity-guide',
    name: 'CRA Conformity Assessment Guide',
    markdown: CRA_CONFORMITY_GUIDE_MD,
  },
};

// Pre-compute HTML versions of all templates at module load time
const TEMPLATES_HTML_CACHE: Record<TemplateType, string> = Object.fromEntries(
  Object.entries(TEMPLATES_RAW).map(([key, template]) => [
    key,
    template.markdown ? (marked.parse(template.markdown) as string) : '',
  ])
) as Record<TemplateType, string>;

// Get pre-computed HTML content for a template
export const getTemplateContent = (templateType: TemplateType): string => {
  return TEMPLATES_HTML_CACHE[templateType] || '';
};

export const DOCUMENTATION_TEMPLATES = TEMPLATES_RAW;

export const getTemplateOptions = () => {
  return Object.entries(TEMPLATES_RAW).map(([key, template]) => ({
    value: key,
    label: template.name,
  }));
};
