import type { RiskPolicy } from "../constants/RiskPolicy";
import type { RouteRiskFactor } from "../types/RouteRisk";

type RoutePlanSeed = {
  id: number;
  user_id: number;
  origin_text: string;
  destination_text: string;
  route_mode: string;
  risk_level: string;
  estimated_minutes: number;
  facility_ids: number[];
  created_at: string;
  risk_policy: RiskPolicy;
  risk_evaluated_at: string;
  risk_factors: RouteRiskFactor[];
};

export const mockData = {
  "userProfile": [
    {
      "id": 1,
      "nickname": "林晓",
      "phone": "13800000001",
      "mobility_type": "LOW_VISION",
      "assistive_device": "盲杖",
      "emergency_contact": "林木 13900000001",
      "preferred_language": "zh-CN",
      "created_at": "2026-06-11T09:00:00Z"
    },
    {
      "id": 2,
      "nickname": "周海",
      "phone": "13800000002",
      "mobility_type": "WHEELCHAIR",
      "assistive_device": "手动轮椅",
      "emergency_contact": "周洋 13900000002",
      "preferred_language": "zh-CN",
      "created_at": "2026-06-12T09:00:00Z"
    },
    {
      "id": 3,
      "nickname": "吴桂芳",
      "phone": "13800000003",
      "mobility_type": "ELDERLY",
      "assistive_device": "助行器",
      "emergency_contact": "吴明 13900000003",
      "preferred_language": "zh-CN",
      "created_at": "2026-06-13T09:00:00Z"
    }
  ],
  "accessibleFacility": [
    {
      "id": 1,
      "facility_type": "TACTILE_PAVING",
      "name": "东门盲道",
      "location_code": "GATE-E-01",
      "floor": "1F",
      "status": "AVAILABLE",
      "last_checked_at": "2026-10-05T09:00:00Z",
      "owner_department": "物业-设施一组",
      "note": "早高峰有志愿者引导"
    },
    {
      "id": 2,
      "facility_type": "WHEELCHAIR_RAMP",
      "name": "中庭轮椅坡道",
      "location_code": "ATR-B-02",
      "floor": "1F",
      "status": "AVAILABLE",
      "last_checked_at": "2026-10-05T09:30:00Z",
      "owner_department": "物业-设施二组",
      "note": "坡道已于 10 月 5 日维修恢复"
    },
    {
      "id": 3,
      "facility_type": "ELEVATOR",
      "name": "北站无障碍电梯",
      "location_code": "LIFT-N-03",
      "floor": "1F-3F",
      "status": "UNKNOWN",
      "last_checked_at": "2026-09-20T09:30:00Z",
      "owner_department": "物业-机电组",
      "note": "巡检长期未更新，状态未知"
    },
    {
      "id": 4,
      "facility_type": "HANDRAIL",
      "name": "连廊扶手",
      "location_code": "BRIDGE-C-04",
      "floor": "2F",
      "status": "MAINTENANCE",
      "last_checked_at": "2026-10-06T14:00:00Z",
      "owner_department": "物业-设施一组",
      "note": "扶手加固施工中"
    }
  ],
  "routePlan": [
    {
      "id": 1,
      "user_id": 1,
      "origin_text": "东门公交站",
      "destination_text": "社区服务中心",
      "route_mode": "WALK",
      "risk_level": "MEDIUM",
      "estimated_minutes": 12,
      "facility_ids": [1],
      "created_at": "2026-10-01T08:00:00Z",
      "risk_policy": "PEAK_HOLD",
      "risk_evaluated_at": "2026-10-01T08:00:00Z",
      "risk_factors": [
        {
          "kind": "FACILITY",
          "ref_id": 1,
          "facility_id": 1,
          "facility_name": "东门盲道",
          "level": "LOW",
          "reason": "设施巡检状态为可用（AVAILABLE）",
          "decisive": false
        },
        {
          "kind": "BARRIER_REPORT",
          "ref_id": 2,
          "facility_id": 1,
          "facility_name": "东门盲道",
          "level": "MEDIUM",
          "reason": "障碍上报 #2 尚未关闭（状态 VERIFIED，中优先级）：盲道被共享单车占用约 10 米",
          "decisive": true
        }
      ]
    },
    {
      "id": 2,
      "user_id": 2,
      "origin_text": "北门停车场",
      "destination_text": "中庭服务台",
      "route_mode": "WHEELCHAIR",
      "risk_level": "HIGH",
      "estimated_minutes": 18,
      "facility_ids": [2],
      "created_at": "2026-09-28T08:00:00Z",
      "risk_policy": "PEAK_HOLD",
      "risk_evaluated_at": "2026-09-28T08:00:00Z",
      "risk_factors": [
        {
          "kind": "FACILITY",
          "ref_id": 2,
          "facility_id": 2,
          "facility_name": "中庭轮椅坡道",
          "level": "HIGH",
          "reason": "设施巡检状态为 BLOCKED，对应高风险",
          "decisive": true
        },
        {
          "kind": "BARRIER_REPORT",
          "ref_id": 1,
          "facility_id": 2,
          "facility_name": "中庭轮椅坡道",
          "level": "HIGH",
          "reason": "障碍上报 #1 尚未关闭（状态 VERIFIED，高优先级）：坡道底部堆放装修板材，轮椅无法上坡",
          "decisive": true
        }
      ]
    },
    {
      "id": 3,
      "user_id": 3,
      "origin_text": "北站出入口",
      "destination_text": "三楼活动室",
      "route_mode": "WALK",
      "risk_level": "HIGH",
      "estimated_minutes": 22,
      "facility_ids": [3, 4],
      "created_at": "2026-10-02T08:00:00Z",
      "risk_policy": "PEAK_HOLD",
      "risk_evaluated_at": "2026-10-02T08:00:00Z",
      "risk_factors": [
        {
          "kind": "FACILITY",
          "ref_id": 3,
          "facility_id": 3,
          "facility_name": "北站无障碍电梯",
          "level": "HIGH",
          "reason": "设施巡检状态为 UNKNOWN，对应高风险",
          "decisive": true
        },
        {
          "kind": "FACILITY",
          "ref_id": 4,
          "facility_id": 4,
          "facility_name": "连廊扶手",
          "level": "MEDIUM",
          "reason": "设施巡检状态为 MAINTENANCE，对应中风险",
          "decisive": false
        },
        {
          "kind": "BARRIER_REPORT",
          "ref_id": 3,
          "facility_id": 4,
          "facility_name": "连廊扶手",
          "level": "MEDIUM",
          "reason": "障碍上报 #3 尚未关闭（状态 SUBMITTED，中优先级）：连廊中段扶手松动，借力有跌落风险",
          "decisive": false
        }
      ]
    }
  ] as RoutePlanSeed[],
  "assistanceRequest": [
    {
      "id": 1,
      "user_id": 1,
      "route_plan_id": 1,
      "helper_id": 1,
      "request_time": "2026-10-03T09:00:00Z",
      "status": "COMPLETED",
      "meet_point": "东门公交站台",
      "contact_note": "到站前电话联系"
    }
  ],
  "barrierReport": [
    {
      "id": 1,
      "reporter_id": 2,
      "facility_id": 2,
      "barrier_type": "RAMP_BLOCKED",
      "description": "坡道底部堆放装修板材，轮椅无法上坡",
      "photo_url": "/mock/photo-ramp-1.png",
      "verify_status": "CLOSED",
      "priority": "HIGH"
    },
    {
      "id": 2,
      "reporter_id": 1,
      "facility_id": 1,
      "barrier_type": "TACTILE_OCCUPIED",
      "description": "盲道被共享单车占用约 10 米",
      "photo_url": "/mock/photo-tactile-2.png",
      "verify_status": "VERIFIED",
      "priority": "MEDIUM"
    },
    {
      "id": 3,
      "reporter_id": 3,
      "facility_id": 4,
      "barrier_type": "HANDRAIL_LOOSE",
      "description": "连廊中段扶手松动，借力有跌落风险",
      "photo_url": "/mock/photo-handrail-3.png",
      "verify_status": "SUBMITTED",
      "priority": "MEDIUM"
    }
  ]
} as const;
