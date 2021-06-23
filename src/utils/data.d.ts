// Program >> Schedule >> Event
import { Dayjs } from "dayjs";

export type daytype = 0 | 1 | 2;
export interface IProgram {

}

export interface ISchedule {
    schedule_id: string
    color: string
    publisher: string
    topic: string
}


export interface IEvent{
    title: string
    abb: string
    dateof: number
    content: strng
    icon: string
}

export interface IUserEvent extends IEvent{
    date: Dayjs
    completed: boolean
    schedule_id: string
    // 해당되는 스케쥴에서 몇 번째로 진행해야 하는지
    seq: number
}

export interface GroupedEvent extends ISchedule{
    events: IUserEvent[]
}

export interface IDailyList {
    start: Dayjs
    end: Dayjs
    data: Daily[]
}

export interface IDaily {
    date: Dayjs
    events: IUserEvent[]
}