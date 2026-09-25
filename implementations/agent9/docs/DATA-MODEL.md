# Data Model

## Entity Relationship Diagram

```text
+-------------------+       +-------------------+
| NomineeEpisode    |-------| IntegrityFlag     |
|-------------------|       |-------------------|
| id (PK)           |   +---| id (PK)           |
| name              |   |   | nominee_id (FK)   |
| position          |   |   | description       |
| status            |   |   | source_id (FK)    |
| hearing_date      |   |   +-------------------+
+-------------------+   |
        |               |   +-------------------+
        |               +---| SourceDocument    |
        |                   |-------------------|
+-------------------+       | id (PK)           |
| CitizenQuestion   |       | url               |
|-------------------|       | publisher         |
| id (PK)           |       | doc_type          |
| nominee_id (FK)   |       | publish_date      |
| content           |       +-------------------+
| upvotes           |
| asked_by_mp_id(FK)|
+-------------------+

+-------------------+       +-------------------+
| MemberOfParliament|-------| Vote              |
|-------------------|       |-------------------|
| id (PK)           |       | id (PK)           |
| name              |       | nominee_id (FK)   |
| constituency      |       | mp_id (FK)        |
| party             |       | vote (AYE/NAY)    |
+-------------------+       +-------------------+
```

## Table Descriptions

- **NomineeEpisode**: The core record of a vetting event.
- **IntegrityFlag**: A specific concern raised against a nominee.
- **SourceDocument**: The verified source backing up an integrity flag.
- **CitizenQuestion**: A question submitted by the public.
- **MemberOfParliament**: MP details for tracking who asked what and how they voted.
- **Vote**: The final vote cast by an MP on a nominee.

## The Integrity Constraint

**Rule**: Every `IntegrityFlag` MUST have a valid `source_id` referencing a `SourceDocument`.
**Why**: This prevents the platform from being used for baseless defamation. By enforcing foreign key constraints at the database level, no flag can exist without an audit trail pointing to an official or reputable document (e.g., EACC report, Court Ruling, Auditor General report).

## Example JSON Record

```json
{
  "nominee": {
    "id": "nom_01H1",
    "name": "Hon. Jane Ochieng",
    "position": "Cabinet Secretary, Lands",
    "status": "VETTING_SCHEDULED",
    "hearing_date": "2024-10-15T09:00:00Z"
  },
  "flags": [
    {
      "id": "flag_01H2",
      "description": "Named in the Ndung'u Land Report regarding irregular allocation in Karura.",
      "source": {
        "url": "https://example.com/ndungu-report.pdf",
        "publisher": "Government of Kenya",
        "doc_type": "Commission Report",
        "publish_date": "2004-12-01"
      }
    }
  ],
  "stats": {
    "citizen_questions": 12,
    "votes": null
  }
}
```
