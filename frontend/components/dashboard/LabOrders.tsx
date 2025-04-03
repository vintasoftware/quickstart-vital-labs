import { VStack, Heading, HStack, Box } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { OrderTestDialog } from "./OrderTestDialog";
import { Card } from "../Card";
import { LabTestTemplates } from "./LabTestTemplates";
import { LabTestOrdersTable } from "./LabTestOrdersTable";
import { fetcher } from "../../lib/client";
import useSWR from "swr";

// Define interfaces for the order data
interface LabOrder {
  name: string;
  date: string;
  user: string;
  status: string;
}

export const LabOrders = () => {
  const { data } = useSWR<LabOrder[]>("/orders/", fetcher);

  const orders = data?.orders ? data.orders : [];
  
  return (
    <HStack width={"100%"} alignItems="stretch" height="100%">
        <VStack width="50%" height="100%">
            <Card>
                <Box height="100%">
                    <Heading>Lab Test Orders</Heading>
                    <Box><OrderTestDialog /></Box>
                    <LabTestOrdersTable orders={orders || []} />
                </Box>
            </Card>
        </VStack>
        <VStack width="50%" height="100%">
            <LabTestTemplates />
        </VStack>
    </HStack>
  );
};
