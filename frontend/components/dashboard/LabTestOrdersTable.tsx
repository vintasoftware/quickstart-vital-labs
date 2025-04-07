import { TableContainer, Table, TableCaption, Thead, Tr, Th, Tbody, Td, Button, useToast } from "@chakra-ui/react";
import { postData } from "../../lib/client";
import { useState } from "react";
import { mutate } from "swr";

// Define the test type
interface LabTest {
  name: string;
  date: string;
  user: string;
  status: string;
}

interface LabTestOrdersTableProps {
  orders: LabOrder[];
}

export const LabTestOrdersTable = ({ orders }: LabTestOrdersTableProps) => {
  const toast = useToast();
  const [cancellingOrders, setCancellingOrders] = useState<Set<string>>(new Set());

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

  console.log(orders);

  return (
    <TableContainer>
      <Table variant="simple">
        <TableCaption>Lab Tests Orders</TableCaption>
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
                <Td>{order.status}</Td>
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
  );
}; 