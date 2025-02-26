import type { NextPage } from "next";
import { VStack, Heading, HStack, Text, Box, Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/react";
import { Card } from "../components/Card";
import { CreateUserVital } from "../components/CreateUserVital";
import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "../lib/client";
import { SleepPanel } from "../components/dashboard/SleepPanel";
import { ActivityPanel } from "../components/dashboard/ActivityPanel";
import { LabOrders } from "../components/dashboard/LabOrders";
const Home: NextPage = () => {
  const [userID, setUserID] = useState(null);
  const { data } = useSWR("/users/", fetcher);

  const usersFiltered = data?.users ? data.users : [];

  return (
    <VStack
      my={10}
      px={10}
      backgroundColor={"#fcfdff"}
      height={"100vh"}
      spacing={10}
      alignItems={"flex-start"}
    >
      <Heading size={"lg"} fontWeight={800}>
        Vital Quickstart
      </Heading>
      {/* Create User Vital */}
      <VStack width={"100%"} alignItems={"flex-start"}>
        <Box width={"100%"}>
          <CreateUserVital
            users={usersFiltered}
            onCreate={setUserID}
            onSelect={setUserID}
          />
        </Box>
      </VStack>
      {/* Tabs */}
      <Tabs defaultIndex={1}>
        <TabList>
          <Tab>Wearables</Tab>
          <Tab>Lab Orders</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            {/* Wearables */}
            <Box width={"100%"}>
              <Card>
                <Heading size={"md"}>2. Visualize user data</Heading>
                <Text>
                  Request user data and plot activity, workout sleep and other
                  health information.
                </Text>
                <HStack width={"100%"} spacing={10} alignItems={"flex-start"}>
                  <Box width={"50%"}>
                    <SleepPanel userId={userID} />
                  </Box>
                  <Box width={"50%"}>
                    <ActivityPanel userId={userID} />
                  </Box>
                </HStack>
              </Card>
            </Box>
          </TabPanel>
          <TabPanel>
            {/* Lab Orders */}
            <Box width={"100%"}>
              <Card>
                <LabOrders />
              </Card>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};

export default Home;
