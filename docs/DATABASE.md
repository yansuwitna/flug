# DATABASE DESIGN: FLAG HUNTER

Database: **MySQL 8**  
ORM: **Prisma ORM**

## Entitas Inti

### 1. User & Authentication
- `User`: id, name, email, passwordHash, role (`ADMIN`, `TEACHER`, `STUDENT`), avatarUrl, createdAt, updatedAt
- `Session` / Token: id, userId, token, expiresAt

### 2. Academic & Class Membership
- `AcademicYear`: id, name, startDate, endDate, isActive
- `SchoolClass`: id, name, gradeLevel, academicYearId
- `ClassMember`: id, classId, userId, roleInClass
- `Subject`: id, code, name, description
- `ClassSubject`: id, classId, subjectId, teacherId
- `Chapter`: id, subjectId, title, orderIndex, description

### 3. Mission & Learning Content
- `Mission`: id, classSubjectId, chapterId, creatorId, title, slug, description, learningObjectives, difficulty, status (`DRAFT`, `PUBLISHED`, `ARCHIVED`), durationMinutes, totalPoints, orderIndex
- `LearningContent`: id, missionId, contentType (`VIDEO_EMBED`, `TEXT`, `LINK`, `DOCUMENT`), title, body, mediaUrl, orderIndex

### 4. Challenge & Flag System
- `Challenge`: id, missionId, title, question, description, challengeType (`TEXT`, `NUMERIC`, `MULTIPLE_CHOICE`, `SEQUENCE`, `CASE_STUDY`), points, orderIndex, status
- `ChallengeOption`: id, challengeId, label, orderIndex (opsi untuk MC/Sequence, tidak menyimpan isCorrect di client)
- `FlagAnswer`: id, challengeId, answerHash, isCaseSensitive, trimSpaces
- `Clue`: id, challengeId, title, hintText, penaltyXp, orderIndex

### 5. Attempt, Progress & Gamification
- `MissionAttempt`: id, userId, missionId, status (`IN_PROGRESS`, `COMPLETED`, `ABANDONED`), startedAt, completedAt, attemptNumber
- `FlagSubmission`: id, attemptId, challengeId, submittedAnswer, isCorrect, pointsAwarded, submittedAt
- `ClueUsage`: id, attemptId, clueId, penaltyDeducted, unlockedAt
- `MissionResult`: id, attemptId, score, xpEarned, completedAt
- `XpTransaction`: id, userId, amount, source (`MISSION_SOLVE`, `CHALLENGE_SOLVE`, `CLUE_PENALTY`), referenceId, createdAt
- `Badge`: id, name, description, iconUrl, criteria
- `UserBadge`: id, userId, badgeId, awardedAt
- `AuditLog`: id, actorId, action, targetResource, metadata, timestamp
