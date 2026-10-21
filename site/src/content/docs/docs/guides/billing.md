---
title: Invoices and paying from the wallet
description: How OpenViCloud bills by the hour, when invoices are issued, and how to pay an invoice from your wallet balance.
---

OpenViCloud bills after use. Usage is recorded during the month, then collected into one monthly invoice. You pay the invoice from your wallet balance. VM and volume unit prices are on the [pricing table](/#pricing).

## What is billed

Prices are per hour. Usage is recorded every 10 minutes.

- **VM**: billed at the price of the VM's size while the VM is in the `Running`, `Ready`, `Frozen` or `Error` state. A `Stopped` VM is not charged the VM price.
- **Volume**: billed by size (GB), from when the volume is created until the deletion is finished, not when you click delete. A volume is still billed when it is not attached to any VM.
- **Snapshot**: each VM or volume snapshot is billed at a fixed hourly price that does not depend on size, from when the snapshot is created until the deletion is finished, not when you click delete.

Load balancers and public IPv6 are free: they do not appear as a usage line and are not billed.

## See this month's cost

Open the sidebar's **Usage** item, under the **Billing** group. The page heading is **Billing**. Use the two arrows to change month. You cannot go past the current month.

- **Total this month** is the total cost for the month, including VMs, volumes and snapshots. The monthly invoice collects exactly these costs.
- The table below only lists the cost of each VM. Volume and snapshot costs are not in the table, so the rows can add up to less than the total.

## When invoices are issued

The invoice for a month is issued on the 1st of the next month, at 02:00 UTC. Months are counted in UTC. You only get an invoice for a month that has recorded usage.

The due date is 7 days after the issue date. An invoice with a total of 0 closes by itself with the state `Paid`; you do not need to do anything.

Open the **Invoices** page to see the list. Each row has the period (**Period**), issue date (**Issued**), due date (**Due**), total (**Total**), state (**Status**) and an **Action** column with the **Pay from wallet** button, when it applies. Click a row to see the details per resource. The **Type** column shows `COMPUTE` (VM), `DISK` (volume) or `SNAPSHOT`.

## Invoice states

| State | Meaning |
|---|---|
| `New` | Not paid, not yet due. |
| `Overdue` | Not paid and past the due date. |
| `Processing` | You just clicked pay; the money is being taken from your wallet. |
| `Settled` | Paid from the wallet. |
| `Paid` | Paid outside the wallet, or the invoice total is 0. |
| `Payment failed` | The payment from the wallet did not succeed. Your wallet was not charged. Top up if needed, then click **Pay from wallet** again. |

## Pay an invoice from the wallet

1. On the **Invoices** page or the invoice detail page, click **Pay from wallet**. The button shows for `New` and `Overdue` invoices.
2. The **Pay invoice from wallet** dialog shows the amount to pay (**Amount due**), your current balance (**Wallet now**) and the balance after paying (**After payment**).
3. Click the **Pay** button with the amount to confirm.
4. The dialog shows **Payment accepted — processing.** The invoice moves to `Processing`, then to `Settled` when the money has been taken. The page updates by itself. A **Spend** line appears in your wallet statement.

Your wallet must hold enough to pay the **whole** invoice. OpenViCloud does not take partial payments. If your wallet is short, the **Pay from wallet** button is disabled: on the **Invoices** list, hover it to see how much is missing; on the invoice detail page, the missing amount is shown next to the button. If your wallet stops being enough at the moment you click, you get the code `INVOICE_WALLET_INSUFFICIENT` (the portal shows **Your wallet no longer covers this invoice. Top up and try again.**) and nothing is taken.

## No automatic charges

Money only leaves your wallet when you click to pay a specific invoice.

- Issuing an invoice does not charge your wallet.
- Topping up the wallet does not pay invoices automatically.
- An overdue invoice is only a reminder. The **Wallet** page shows a notice when you have an overdue invoice. Running resources are not affected, and you can still create new resources.
