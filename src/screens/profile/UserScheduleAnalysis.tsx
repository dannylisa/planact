import useTheme from "@/modules/theme/hooks";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Dimensions,StyleSheet, View } from "react-native";
import { Button, GaugeBar, Text } from "@components/materials"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { IUserSchedule } from "@/utils/data";
import { ScrollView } from "react-native-gesture-handler";
import { DefaultTheme } from "@/style/styled";
import { useDailyList } from "@/modules/userDailyList/hooks";
import dayjs from "dayjs";
import { LineChart } from "react-native-chart-kit";
import media from "@/style/media";
import {deleteUserSchedule, deleteUserScheduleAfter} from "@/api/profile/deleteUserSchedule";
import { useUserState } from "@/modules/auth/hooks";
import { useUserSchedule } from "@/modules/userSchedule/hooks";
import { NewScheduleComment, ScheduleCommentsList, useScheduleComments } from "@/components/scheduleComments";

type RouteParams = {
    Detail: {
        user_schedule: IUserSchedule
    };
}
export default function () {
    const { getToken } = useUserState();
    const { fetchUserSchedule } = useUserSchedule()
    const { initialDailyFetch } = useDailyList()

    // Route Settings
    const {params:{user_schedule}} = useRoute<RouteProp<RouteParams, 'Detail'>>()
    const navigation = useNavigation()
    useEffect(() => {
        navigation.setOptions({title: user_schedule.alias})
    },[user_schedule.id])
    
    // Comments
    const {comments, resetComments, createComment, deleteComment} = useScheduleComments(user_schedule.schedule.id);
    useEffect(() => {
        getToken().then(token =>{
            if(token)
                resetComments(token)
        });
      }, [user_schedule.schedule.id]);
    // Style Settings
    const theme = useTheme()
    const {wrapper, menu, padding, chartContainer} = useMemo(() => styles(theme), [theme]);

    // Get Daily Events
    const {dailys} = useDailyList();
    const today = dayjs();
    const latest = useMemo(() =>  dailys.filter(
            daily => today.diff(daily.date, 'hours') > 0
        )
        .map(
            daily => {
                const proofs = daily.events.filter(
                        userevent => userevent.event.schedule === user_schedule.schedule.id
                    ).map(event => event.proof)
                return {
                    date: daily.date,
                    score: proofs.map(Boolean).map(Number).reduce((a,b)=>a+b, 0),
                    count: proofs.length,
               }
            }
        ).filter(daily => daily.count),
        [user_schedule.schedule.id, user_schedule.achievement]
    )

    const onDelete = (all:boolean) => () => {
        Alert.alert(
            (all?
                '????????? ?????? ?????????????????????? ????????? ????????? ???????????? ????????????.'
                :
                `${user_schedule.alias}??? ?????? ?????? ????????? ?????????????????????????`
            ),
            '',
            [
                {
                  text: "??????",
                  style: "cancel"
                },
                { 
                    text: "???", 
                    onPress: 
                    () =>  getToken()
                        .then((token) => {
                            if(!token)
                                throw Error
                            all ?
                                deleteUserSchedule(token, user_schedule.id)
                                :
                                deleteUserScheduleAfter(token, user_schedule.id)
                            return token
                        }).then((token) => {
                            Alert.alert('????????? ?????????????????????.');
                            fetchUserSchedule(token); 
                            initialDailyFetch(token);
                            navigation.navigate('Profile');
                        })
                },
            ])
    }

    const [dangerVisible, setDangerVisible] = useState<boolean>(false)
    const toggleDangerVisible = () => setDangerVisible(prev => !prev)

    return(
        <KeyboardAwareScrollView style={{flex:1, marginBottom:0}}>
            <ScrollView style={wrapper}>
                {/* ????????? */}
                <View style={padding}>
                    <Text
                        align="left"
                        bold
                        headings={1}
                        content="?????? ?????????"
                        marginBottom={10}
                    />
                    <GaugeBar 
                        num={
                            (user_schedule?.achievement || 0)
                        }
                        denom={(user_schedule?.schedule.count_events || 1)} />
                </View>
                
                {/* ????????? ????????? */}
                {latest.length ?
                <View style={chartContainer} >
                    <LineChart 
                        data={{
                            labels:latest.map(daily => daily.date.format('M/D')),
                            datasets:[{
                                data: latest.map(daily => 100* daily.score / daily.count)
                            }]
                        }}
                        width={Dimensions.get('screen').width*0.95}
                        height={220}
                        chartConfig={{
                            backgroundColor:theme.primary.main,
                            backgroundGradientFrom: theme.primary.main,
                            backgroundGradientFromOpacity: 1,
                            backgroundGradientTo: theme.primary.main,
                            backgroundGradientToOpacity: 0.85,
                            decimalPlaces: 0, // optional, defaults to 2dp
                            color: (opacity = 1) => (
                                theme.primary.text
                            ),
                            propsForLabels:{
                                ...media.vertical('fontSize', 15, 14),
                            }
                        }}
                        yAxisSuffix="%"
                        yLabelsOffset={12}
                        withInnerLines={false}
                        bezier
                        fromZero
                        style={{
                            borderRadius: 16,
                        }}
                    />
                </View>
                :
                <>
                <Text 
                    marginTop={70}
                    content="?????? ????????? ????????? ????????????." 
                />
                <Text
                    marginVertical={10}
                    content="?????? ????????? ???????????? ????????? ????????? ???????????????." 
                />
                <Text
                    marginBottom={70}
                    content="?????? ????????? ?????? ????????? ???????????? ?????? ??? ????????????." 
                />
                </>
                }

                
                
            {/* ??????  */}
                <ScheduleCommentsList
                    style={{padding:10}}
                    schedule_id={user_schedule.schedule.id}
                    count_events={user_schedule?.schedule.count_events || 1}
                    comments={comments}
                    deleteComment={deleteComment}
                />

                <NewScheduleComment
                    style={{padding:10}}
                    createComment={createComment}
                />


                <Button 
                    color="danger"
                    content="Danger Zone"
                    style={{marginTop:40, marginBottom:20}}
                    onPress={toggleDangerVisible}
                />{
                    dangerVisible && (
                        <>
                <View style={menu}>
                    <View style={{flex: 5}}>
                        <Text
                            bold
                            align="left"
                            headings={2}
                            content="?????? ?????? ????????????"
                        />
                        <Text
                            align="left"
                            headings={3}
                            marginTop={3}
                            content="????????? ?????? ????????? ???????????????. "
                        />
                    </View>
                    <Button
                        flex={2}
                        content="??????" 
                        color="danger" 
                        onPress={onDelete(false)}
                    />
                </View>
                <View style={menu}>
                    <View style={{flex: 5}}>
                        <Text
                            bold
                            align="left"
                            headings={2}
                            content="?????? ????????????"
                        />
                        <Text
                            align="left"
                            headings={3}
                            marginTop={3}
                            content="?????? ????????? ?????? ???????????????. "
                        />
                    </View>
                    <Button
                        flex={2}
                        content="??????" 
                        color="danger"
                        onPress={onDelete(true)}
                    />
                </View>
                </>
                )}
            </ScrollView>
        </KeyboardAwareScrollView>
    )
}

const styles = ({mainBackground}:DefaultTheme) => {
    return StyleSheet.create({
        wrapper: {
            flex:1,
            backgroundColor: mainBackground
        },
        padding:{
            padding: 12
        },
        menu: {
            flexDirection: "row",
            alignItems: "center",
            padding: 12,
            paddingHorizontal: 20,
        },
        chartContainer:{
            flex: 1,
            width: "100%",
            alignItems:"center",
            justifyContent:"center",
            paddingVertical: 10
        }
    })
}