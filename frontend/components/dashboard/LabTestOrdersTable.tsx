import { TableContainer, Table, Thead, Tr, Th, Tbody, Td, Button, useToast } from "@chakra-ui/react";
import { Card } from "../Card";
import { postData, fetcher } from "../../lib/client";
import { useState } from "react";
import useSWR, { mutate } from "swr";
import { OrderTestDialog } from "./OrderTestDialog";
import { useLabResultsPDF } from "../../lib/pdfUtils";


interface LabOrder {
  id: string;
  lab_test: {
    name: string;
  };
  created_at: string;
  patient_details: {
    first_name: string;
    last_name: string;
  };
  status: string;
}


export const LabTestOrdersTable = () => {
  const toast = useToast();
  const [cancellingOrders, setCancellingOrders] = useState<Set<string>>(new Set());
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null);
  const { pdfData } = useLabResultsPDF(downloadingOrderId);

  const { data } = useSWR<LabOrder[]>("/orders/", fetcher);

  const orders = data?.orders ? data.orders : [];

  const handleCancelOrder = async (orderId: string) => {
    setCancellingOrders(prev => new Set([...prev, orderId]));
    
    try {
      await postData(`/orders/${orderId}/cancel/`, { order_id: orderId });
      
      toast({
        title: "Order cancelled successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh the orders list
      await mutate('/orders/');
      
    } catch (error) {
      toast({
        title: "Failed to cancel order",
        description: "Please try again later",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setCancellingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const handleStatusClick = (order: any) => {
    if (order.status.toUpperCase() === "COMPLETED") {
      setDownloadingOrderId(order.id);
    }
  };

  // Reset downloadingOrderId when download completes
  if (pdfData && downloadingOrderId) {
    setDownloadingOrderId(null);
    toast({
      title: "Results downloaded",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  }

  return (
    <Card>
      <OrderTestDialog />
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Test Name</Th>
              <Th>Date</Th>
              <Th>User</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {orders.length > 0 ? (
              orders.map((order: any, index: any) => (
                <Tr key={index}>
                  <Td>{order.lab_test.name}</Td>
                  <Td>{order.created_at}</Td>
                  <Td>{order.patient_details.first_name} {order.patient_details.last_name}</Td>
                  <Td
                    textTransform="capitalize"
                    cursor={order.status.toUpperCase() === "COMPLETED" ? "pointer" : "default"}
                    color={order.status.toUpperCase() === "COMPLETED" ? "blue.500" : "inherit"}
                    opacity={downloadingOrderId === order.id ? 0.5 : 1}
                    _hover={{
                      textDecoration: order.status.toUpperCase() === "COMPLETED" ? "underline" : "none"
                    }}
                    onClick={() => handleStatusClick(order)}
                  >
                    {order.status}
                    {downloadingOrderId === order.id && " (Downloading...)"}
                  </Td>
                  <Td>
                    <Button
                      colorScheme="red"
                      size="sm"
                      onClick={() => handleCancelOrder(order.id)}
                      isDisabled={order.status === 'cancelled'}
                      isLoading={cancellingOrders.has(order.id)}
                      loadingText="Cancelling"
                    >
                      Cancel Order
                    </Button>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={5} textAlign="center">No lab orders available</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </Card>
  );
}; 