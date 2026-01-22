import type { OperationData, Operation } from "@/types/database"

export async function createOperationViaAPI(operationData: OperationData): Promise<Operation | null> {
  try {
    console.log("Sending operation to API:", operationData.id)
    console.log("Operation data:", JSON.stringify(operationData, null, 2))

    const response = await fetch("/api/operations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(operationData),
    })

    console.log("API Response status:", response.status)
    console.log("API Response ok:", response.ok)

    const responseData = await response.json()
    console.log("API Response data:", responseData)

    if (!response.ok) {
      console.error("API Error:", responseData)
      throw new Error(`API Error: ${responseData.error || "Unknown error"}`)
    }

    const { operation } = responseData
    console.log("Operation created via API:", operation.id)
    return operation
  } catch (error) {
    console.error("Error calling API:", error)
    throw error // Re-throw to let the caller handle it
  }
}
