import { DefaultTheme } from '@/style/styled';
import { GroupedEvent, IUserSchedule, IUserEvent } from '@/utils/data';
import { korday } from '@/utils/date';
import React, { useState, useEffect } from 'react';
import { Text } from '@components/materials';
import { View, StyleSheet, ScrollView } from 'react-native';
import ToggleEventList from './ToggleEventList';
import { useDailyList } from '@/modules/userDailyList/hooks';
import useTheme from '@/modules/theme/hooks';
import { useUserSchedule } from '@/modules/userSchedule/hooks';

const groupBySchedule = (user_schedules: IUserSchedule[], user_events: IUserEvent[]): GroupedEvent[] => {
    if (!user_events.length) return [];

    const res: { [key: string]: GroupedEvent } = {};

    user_schedules.forEach((schedule) => {
      res[schedule.schedule.id] = {
        schedule,
        events: [],
      };
    });

    user_events.forEach((event) => {
      res[event.event.schedule].events.push(event);
    });
    user_events.sort((a, b) => +a.event.seq - +b.event.seq);
    return Object.values(res).filter(({ events }) => events.length > 0);
};

function DailyView() {
  const theme = useTheme();
  const { getSelectedDaily } = useDailyList();
  const { schedules } = useUserSchedule();
  const { date, events } = getSelectedDaily();

  const { container } = React.useMemo(() => styles(theme), [theme]);
  const [groupedEvents, setGroupedEvents] = useState<GroupedEvent[]>([]);

  useEffect(() => {
    const aggregated = groupBySchedule(
      [...schedules], 
      [...events]
      );
    setGroupedEvents(aggregated);
  }, [date]);
  return (
    <>
        <Text
          bold
          headings={2}
          content={date.format(`M월 D일 ${korday[date.day()]}요일`)}
          marginTop={10}
          marginBottom={12}
        />
    <ScrollView style={container}>
      {groupedEvents.length ?
      groupedEvents.map(({ schedule, events }, idx) => (
        <ToggleEventList schedule={schedule} events={events} key={idx} />
      ))
      :
      <> 
      <Text 
        bold
        content="일정이 없습니다." 
        marginTop={150} />
      <Text 
        bold
        content="마켓에서 당신에게 맞는 플랜을 다운받으세요!" 
        marginTop={10}
      />
      </>
    }
    </ScrollView>
    </>
  );
}

const styles = (theme: DefaultTheme) => {
  const { mainBackground } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: mainBackground,
      padding: 5,
      paddingHorizontal: 10,
    },
    title: {
      height: 36,
      marginTop: 6,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
};

export default DailyView;
