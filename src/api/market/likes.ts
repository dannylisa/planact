import { ITokenHeader } from "@/modules/auth/hooks";
import axios, { AxiosError, AxiosResponse } from "axios";
import { APP_BASE_URL } from "../host";

export async function toggleScheduleLike (token:ITokenHeader, schedule_id:string) {
    await axios.post(`${APP_BASE_URL}schedule/like/${schedule_id}`, {}, {
        headers: token
    }).then((res:AxiosResponse) => null)
    .catch((err:AxiosError) => console.log(err.response))
}

export async function toggleScheduleCommentLike (token:ITokenHeader, comment_id:string) {
    await axios.post(`${APP_BASE_URL}schedule/comment/like/${comment_id}`, {}, {
        headers: token
    }).then((res:AxiosResponse) => null)
    .catch((err:AxiosError) => console.log(err.response))
}