import { db } from "@/lib/firebase/config";
import { doc, updateDoc } from "firebase/firestore";

export const createCustomer = async (
  uid: string,
  email: string,
  first_name: string | undefined = undefined,
  last_name: string | undefined = undefined
) => {
  const customerData = { uid, email, first_name, last_name };

  try {
    const response = await fetch("/api/paystack/create-customer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customerData),
    });

    const { data } = await response.json();

    if (response.ok) {
      // console.log("Customer created successfully:", data);
      await updateUserPaystackId(uid, data.customer_code);
      return {
        data: { customer_code: data.customer_code },
        statusCode: 201,
        success: true,
      };
    } else {
      // console.error("Error creating customer:", data);
      return { data: null, statusCode: 500, success: false };
    }
  } catch (error) {
    return { data: null, statusCode: 500, success: false };
  }
};

const updateUserPaystackId = async (
  userId: string,
  paystackId: string
): Promise<void> => {
  try {
    const userDocRef = doc(db, "users", userId);

    // Update the paystack_id field
    await updateDoc(userDocRef, {
      paystack_id: paystackId,
    });

    // console.log(`Updated paystack_id for user ${userId}`);
  } catch (error) {
    // console.error("Error updating Firestore user:", error);
    throw error;
  }
};
