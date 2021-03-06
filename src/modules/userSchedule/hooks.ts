import { getUserSchedule } from "@/api/home/getSchedule";
import { IUserSchedule } from "@/utils/data";
import { AxiosError, AxiosResponse } from "axios";
import { Dispatch } from "react";
import { useDispatch, useSelector } from "react-redux"
import { 
    UserScheduleAction, 
    USER_SCHEDULES_ACHIEVEMENT_UPDATE, 
    USER_SCHEDULES_FETCH, 
} from "./reducer";
import { GlobalState } from "../index"
import { ITokenHeader, useUserState } from "../auth/hooks";

export const useUserSchedule = () => {
    const dispatch:Dispatch<UserScheduleAction> = useDispatch();
    const schedules = useSelector( ({ userSchedulesState }: GlobalState) => userSchedulesState);
    
    const fetchUserSchedule = async (token:ITokenHeader):Promise<boolean> => {
        try {
            const res = await getUserSchedule(token);
            dispatch({ type: USER_SCHEDULES_FETCH, schedules: res.data });
            return true;
        } catch (err) {
            return false;
        }
    }

    // Schedule의 ID로 스케쥴 찾음
    const getScheduleById = (schedule_id: string) => {
        return schedules.find((schedule) => schedule.schedule.id === schedule_id)
    }

    const updateAchievement = (userschedule_id:string, changedProof:number) => {
        dispatch({
            type: USER_SCHEDULES_ACHIEVEMENT_UPDATE, 
            proofChanges:{
                userschedule_id,
                value: changedProof
            }
        })
    }

    return {
        schedules,
        fetchUserSchedule,
        getScheduleById,
        updateAchievement
    }
}