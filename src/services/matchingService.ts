/**
 * 岗位匹配算法服务
 */

import { Position, UserProfile, MatchingDetails } from '@/types';
import { MATCHING_WEIGHTS, EDUCATION_LEVEL_ORDER, DEGREE_TYPE_ORDER } from '@/constants';

class MatchingService {
  // 计算岗位匹配度
  calculateMatchingScore(position: Position, userProfile: UserProfile): MatchingDetails {
    const details: MatchingDetails = {
      educationMatch: false,
      educationScore: 0,
      degreeMatch: false,
      degreeScore: 0,
      majorMatch: false,
      majorScore: 0,
      politicalStatusMatch: false,
      politicalStatusScore: 0,
      workExperienceMatch: false,
      workExperienceScore: 0,
      ageMatch: false,
      ageScore: 0,
      totalScore: 0,
      matchPercentage: 0,
      recommendations: [],
    };

    // 1. 学历匹配
    const educationResult = this.matchEducation(position.educationRequirement, userProfile.educationLevel);
    details.educationMatch = educationResult.match;
    details.educationScore = educationResult.score * MATCHING_WEIGHTS.EDUCATION * 100;
    if (!educationResult.match) {
      details.recommendations.push(educationResult.recommendation);
    }

    // 2. 学位匹配
    const degreeResult = this.matchDegree(position.degreeRequirement, userProfile.degree);
    details.degreeMatch = degreeResult.match;
    details.degreeScore = degreeResult.score * MATCHING_WEIGHTS.DEGREE * 100;
    if (!degreeResult.match) {
      details.recommendations.push(degreeResult.recommendation);
    }

    // 3. 专业匹配
    const majorResult = this.matchMajor(position.majorRequirement, userProfile.major);
    details.majorMatch = majorResult.match;
    details.majorScore = majorResult.score * MATCHING_WEIGHTS.MAJOR * 100;
    if (!majorResult.match) {
      details.recommendations.push(majorResult.recommendation);
    }

    // 4. 政治面貌匹配
    const politicalResult = this.matchPoliticalStatus(
      position.politicalStatusRequirement,
      userProfile.politicalStatus
    );
    details.politicalStatusMatch = politicalResult.match;
    details.politicalStatusScore = politicalResult.score * MATCHING_WEIGHTS.POLITICAL_STATUS * 100;
    if (!politicalResult.match) {
      details.recommendations.push(politicalResult.recommendation);
    }

    // 5. 工作经验匹配
    const workExpResult = this.matchWorkExperience(
      position.workExperienceRequired,
      position.minWorkYears,
      userProfile.hasWorkExperience,
      userProfile.workYears
    );
    details.workExperienceMatch = workExpResult.match;
    details.workExperienceScore = workExpResult.score * MATCHING_WEIGHTS.WORK_EXPERIENCE * 100;
    if (!workExpResult.match) {
      details.recommendations.push(workExpResult.recommendation);
    }

    // 6. 年龄匹配
    const ageResult = this.matchAge(position.minAge, position.maxAge, userProfile.age);
    details.ageMatch = ageResult.match;
    details.ageScore = ageResult.score * MATCHING_WEIGHTS.AGE * 100;
    if (!ageResult.match) {
      details.recommendations.push(ageResult.recommendation);
    }

    // 计算总分
    details.totalScore =
      details.educationScore +
      details.degreeScore +
      details.majorScore +
      details.politicalStatusScore +
      details.workExperienceScore +
      details.ageScore;

    details.matchPercentage = details.totalScore;

    return details;
  }

  // 学历匹配
  private matchEducation(
    required: string,
    userEducation: string
  ): { match: boolean; score: number; recommendation: string } {
    const requiredLevel = EDUCATION_LEVEL_ORDER[required as keyof typeof EDUCATION_LEVEL_ORDER] || 0;
    const userLevel = EDUCATION_LEVEL_ORDER[userEducation as keyof typeof EDUCATION_LEVEL_ORDER] || 0;

    if (userLevel >= requiredLevel) {
      return {
        match: true,
        score: 1,
        recommendation: '',
      };
    }

    return {
      match: false,
      score: userLevel / requiredLevel,
      recommendation: `学历不符：要求${required}，您的学历为${userEducation}`,
    };
  }

  // 学位匹配
  private matchDegree(
    required: string,
    userDegree: string
  ): { match: boolean; score: number; recommendation: string } {
    const requiredLevel = DEGREE_TYPE_ORDER[required as keyof typeof DEGREE_TYPE_ORDER] || 0;
    const userLevel = DEGREE_TYPE_ORDER[userDegree as keyof typeof DEGREE_TYPE_ORDER] || 0;

    if (userLevel >= requiredLevel) {
      return {
        match: true,
        score: 1,
        recommendation: '',
      };
    }

    return {
      match: false,
      score: requiredLevel === 0 ? 1 : userLevel / requiredLevel,
      recommendation: `学位不符：要求${required}，您的学位为${userDegree}`,
    };
  }

  // 专业匹配
  private matchMajor(
    requiredMajors: string[],
    userMajor: string
  ): { match: boolean; score: number; recommendation: string } {
    if (!requiredMajors || requiredMajors.length === 0) {
      return {
        match: true,
        score: 1,
        recommendation: '',
      };
    }

    // 检查是否有"不限"或"专业不限"
    const noLimit = requiredMajors.some(m => 
      m.includes('不限') || m.includes('无限制') || m === '全部'
    );
    if (noLimit) {
      return {
        match: true,
        score: 1,
        recommendation: '',
      };
    }

    // 精确匹配
    const exactMatch = requiredMajors.some(m => m === userMajor);
    if (exactMatch) {
      return {
        match: true,
        score: 1,
        recommendation: '',
      };
    }

    // 模糊匹配
    const fuzzyMatch = requiredMajors.some(m => 
      m.includes(userMajor) || userMajor.includes(m)
    );
    if (fuzzyMatch) {
      return {
        match: true,
        score: 0.8,
        recommendation: '',
      };
    }

    return {
      match: false,
      score: 0,
      recommendation: `专业不符：要求${requiredMajors.join('、')}，您的专业为${userMajor}`,
    };
  }

  // 政治面貌匹配
  private matchPoliticalStatus(
    required: string[],
    userStatus: string
  ): { match: boolean; score: number; recommendation: string } {
    if (!required || required.length === 0) {
      return {
        match: true,
        score: 1,
        recommendation: '',
      };
    }

    // 检查是否有"不限"
    const noLimit = required.some(s => s.includes('不限'));
    if (noLimit) {
      return {
        match: true,
        score: 1,
        recommendation: '',
      };
    }

    const match = required.includes(userStatus);
    if (match) {
      return {
        match: true,
        score: 1,
        recommendation: '',
      };
    }

    return {
      match: false,
      score: 0,
      recommendation: `政治面貌不符：要求${required.join('或')}，您的政治面貌为${userStatus}`,
    };
  }

  // 工作经验匹配
  private matchWorkExperience(
    required: boolean,
    minYears: number | undefined,
    hasExperience: boolean,
    userYears: number
  ): { match: boolean; score: number; recommendation: string } {
    if (!required) {
      return {
        match: true,
        score: 1,
        recommendation: '',
      };
    }

    if (!hasExperience) {
      return {
        match: false,
        score: 0,
        recommendation: '该岗位要求有工作经验',
      };
    }

    if (minYears !== undefined && userYears < minYears) {
      return {
        match: false,
        score: userYears / minYears,
        recommendation: `工作年限不足：要求${minYears}年以上，您有${userYears}年工作经验`,
      };
    }

    return {
      match: true,
      score: 1,
      recommendation: '',
    };
  }

  // 年龄匹配
  private matchAge(
    minAge: number | undefined,
    maxAge: number | undefined,
    userAge: number
  ): { match: boolean; score: number; recommendation: string } {
    if (minAge === undefined && maxAge === undefined) {
      return {
        match: true,
        score: 1,
        recommendation: '',
      };
    }

    if (minAge !== undefined && userAge < minAge) {
      return {
        match: false,
        score: 0,
        recommendation: `年龄不符：要求${minAge}岁以上，您的年龄为${userAge}岁`,
      };
    }

    if (maxAge !== undefined && userAge > maxAge) {
      return {
        match: false,
        score: 0,
        recommendation: `年龄不符：要求${maxAge}岁以下，您的年龄为${userAge}岁`,
      };
    }

    return {
      match: true,
      score: 1,
      recommendation: '',
    };
  }

  // 批量计算匹配度
  calculateBatchMatchingScores(positions: Position[], userProfile: UserProfile): Position[] {
    return positions.map(position => {
      const matchingDetails = this.calculateMatchingScore(position, userProfile);
      return {
        ...position,
        matchingScore: matchingDetails.totalScore,
        isMatched: matchingDetails.totalScore >= 60, // 60分及以上视为匹配
      };
    });
  }

  // 获取推荐岗位（按匹配度排序）
  getRecommendedPositions(positions: Position[], userProfile: UserProfile, limit: number = 10): Position[] {
    const scoredPositions = this.calculateBatchMatchingScores(positions, userProfile);
    return scoredPositions
      .sort((a, b) => (b.matchingScore || 0) - (a.matchingScore || 0))
      .slice(0, limit);
  }

  // 筛选匹配的岗位
  filterMatchedPositions(positions: Position[], userProfile: UserProfile, minScore: number = 60): Position[] {
    const scoredPositions = this.calculateBatchMatchingScores(positions, userProfile);
    return scoredPositions.filter(p => (p.matchingScore || 0) >= minScore);
  }
}

// 导出单例
export const matchingService = new MatchingService();
