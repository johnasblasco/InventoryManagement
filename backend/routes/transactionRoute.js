import express from 'express';
import Transaction from '../models/transactionModel.js';
import Product from '../models/productModel.js';
import Customer from '../models/customerModel.js';
import Counter from '../models/counterModel.js';
import requireAuth from '../middleware/requireAuth.js';
import RMA from '../models/RmaModel.js';
const router = express.Router();

// requireAuth for all transactions routes
//router.use(requireAuth)

// Function to generate a new transaction ID
const generateTransactionId = async () => {
  try {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'transaction_id' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    if (!counter) {
      throw new Error('Failed to generate transaction_id');
    }

    return `SO-${counter.seq.toString().padStart(3, '0')}`;
  } catch (error) {
    throw new Error('Error generating transaction ID');
  }
};

// Create Transaction
router.post('/', async (req, res) => {
  try {
    const {
      products,
      customer,
      total_price,
      transaction_date,
      total_amount_paid_paid,
      payment_status,
      cashier,
      discount,
      vat,
      payment_method,
      status,
    } = req.body;

    // Validate required fields
    if (!products || !customer || !total_price || !transaction_date || payment_status === undefined) {
      return res.status(400).json({
        message: 'Products, customer, total_price, transaction_date, and payment_status are required',
      });
    }

    console.log('Received transaction data:', req.body);

    const productItems = await Promise.all(
      products.map(async (item) => {
        const { product: productId, serial_number: unitIds, item_status, reason_for_refund } = item;

        // Check for valid serial numbers
        if (!Array.isArray(unitIds) || unitIds.length === 0) {
          throw new Error(`Serial numbers (unit IDs) are missing or not in the correct format for product ID ${productId}`);
        }

        const productDoc = await Product.findById(productId);
        if (!productDoc) {
          throw new Error(`Product with ID ${productId} not found`);
        }

        console.log(`Units for product ${productId}:`, productDoc.units);

        const processedUnits = [];

        for (let unitId of unitIds) {
          console.log(`Processing product ${productId} with unit ID ${unitId}`);

          const productUnit = productDoc.units.find(
            (unit) => unit._id.toString() === unitId && unit.status === 'in_stock'
          );

          if (!productUnit) {
            console.warn(`Skipping unit ID ${unitId} - already sold or unavailable`);
            continue;
          }

          // Mark the unit as 'sold'
          productUnit.status = 'sold';

          processedUnits.push({
            product: productId,
            serial_number: productUnit.serial_number,
            price: productDoc.selling_price,
          });
        }

        if (processedUnits.length === 0) {
          throw new Error(`No available units for product ID ${productId}`);
        }

        await productDoc.save(); // Save the product document to update the status of units

        return {
          product: productId,
          serial_number: processedUnits.map((unit) => unit.serial_number),
          price: productDoc.selling_price,
          quantity: processedUnits.length, // Track sold units
        };
      })
    );

    // Calculate total price with VAT and discount
    const totalPriceWithoutVat = productItems.reduce(
      (acc, curr) => acc + curr.quantity * curr.price,
      0
    );

    const transaction_id = await generateTransactionId();
    const dueDate = new Date(transaction_date);
    dueDate.setDate(dueDate.getDate() + 1);

    const newTransaction = new Transaction({
      transaction_id,
      products: productItems.map((item) => ({
        product: item.product,
        serial_number: item.serial_number,
        quantity: item.quantity,
        price: item.price,
        item_status: item.item_status,
        reason_for_refund: item.reason_for_refund,
      })),
      customer,
      total_price,
      total_amount_paid_paid,
      transaction_date,
      due_date: dueDate,
      payment_status,
      cashier,
      discount,
      vat,
      payment_method,
      status
    });

    const transaction = await newTransaction.save();
    return res.status(201).send(transaction);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: error.message });
  }
});
















router.get('/', async (req, res) => {
  try {
    let query = {};

    // Build query based on request parameters
    if (req.query.payment_status) {
      query.payment_status = req.query.payment_status;
    }

    if (req.query.transaction_id) {
      query.transaction_id = { $regex: req.query.transaction_id, $options: 'i' };
    }

    // Filter by cashier name with partial matching
    if (req.query.cashier) {
      query.cashier = { $regex: req.query.cashier, $options: 'i' }; 
    }

    // Date filtering
    if (req.query.startDate && req.query.endDate) {
      query.transaction_date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    } else if (req.query.startDate) {
      query.transaction_date = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      query.transaction_date = { $lte: new Date(req.query.endDate) };
    }

    // Log the incoming request query
    console.log('Request Query:', req.query);

    // Apply status filters
    if (req.query.statusFilters) {
      const statusFilters = JSON.parse(req.query.statusFilters);
      const itemStatusConditions = [];

      // Check for each status and add it to the conditions if checked
      if (statusFilters.Completed) {
        itemStatusConditions.push({ status: 'Completed' });
      }
      if (statusFilters.Refunded) {
        itemStatusConditions.push({ status: 'Refunded' });
      }
      if (statusFilters.Replaced) {
        itemStatusConditions.push({ status: 'Replaced' });
      }

      // If any statuses were selected, add them to the query
      if (itemStatusConditions.length > 0) {
        query.$or = itemStatusConditions; // Use $or for top-level query
      }
    }



    // Log the constructed query before executing it
    console.log('Constructed Query:', query);

    // Sorting
    let sort = {}; // Define your sorting logic if needed

    // Populate customer while querying
    const transactions = await Transaction.find(query)
      .populate('products.product')
      .populate('customer')
      .sort(sort);

    // If a customer name filter is applied, filter the results after population
    if (req.query.customer) {
      const customerRegex = new RegExp(req.query.customer, 'i'); // Case-insensitive regex
      const filteredTransactions = transactions.filter(transaction =>
        transaction.customer && customerRegex.test(transaction.customer.name)
      );
      return res.status(200).json({ count: filteredTransactions.length, data: filteredTransactions });
    }

    return res.status(200).json({ count: transactions.length, data: transactions });

  } catch (error) {
    console.error(error);
    return res.status(500).send('Server Error');
  }
});








// Get Single Transaction
router.get('/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await Transaction.findOne({ transaction_id: transactionId })
      .populate('products.product')
      .populate('customer');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    return res.status(200).json(transaction);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server Error');
  }
});

router.put('/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { payment_status, cashier, discount, status, payment_method, total_amount_paid, products } = req.body;

    // Validate payment_status input
    if (payment_status && !['paid', 'unpaid'].includes(payment_status)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    // Validate discount input
    if (discount !== undefined && typeof discount !== 'number') {
      return res.status(400).json({ message: 'Invalid discount value' });
    }

    // Prepare update object for the transaction
    const updateFields = {};
    if (payment_status) updateFields.payment_status = payment_status;
    if (cashier) updateFields.cashier = cashier;
    if (discount !== undefined) updateFields.discount = discount; // Add discount
    if (status) updateFields.status = status; // Add status
    if (payment_method) updateFields.payment_method = payment_method; // Add payment method
    if (total_amount_paid !== undefined) updateFields.total_amount_paid = total_amount_paid; // Add total amount

    // Update transaction
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { transaction_id: transactionId },
      { $set: updateFields },
      { new: true } // Return the updated document
    );

    if (!updatedTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Update the status of each unit (serial number) to "sold"
    if (products && Array.isArray(products)) {
      const unitUpdates = products.map(product => {
        return {
          updateOne: {
            filter: { 
              "units.serial_number": { $in: product.serial_number } // Filter by serial number
            },
            update: {
              $set: { "units.$.status": 'sold' } // Set status to 'sold'
            }
          }
        };
      });

      // Perform bulk update for all units
      await Product.bulkWrite(unitUpdates);
    }

    return res.status(200).json(updatedTransaction);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server Error');
  }
});




// Update Transaction
router.put('/:id', async (req, res) => {
  try {
    const { products, customer, total_amount_paid_paid, source, cashier } = req.body;
    const { id } = req.params;

    // Validate required fields
    if (!products || !total_amount_paid_paid || !cashier) {
      return res.status(400).send({ message: 'Products, total_amount_paid_paid, and cashier are required' });
    }

    // Process products
    const productItems = await Promise.all(products.map(async (item) => {
      const { product: productId, quantity } = item;
      const productDoc = await Product.findById(productId);
      if (!productDoc) {
        throw new Error(`Product with id ${productId} not found`);
      }
      return {
        product: productId,
        quantity,
        price: productDoc.selling_price
      };
    }));

    // Calculate total price
    const total_price = productItems.reduce((acc, curr) => {
      const productPrice = curr.quantity * curr.price;
      return acc + productPrice;
    }, 0);

    // Optionally handle payment_status update if source is included
    const payment_status = source ? (source === 'pos' ? 'paid' : 'unpaid') : undefined;

    const transaction = await Transaction.findByIdAndUpdate(id, {
      products: productItems,
      customer,
      total_price,
      total_amount_paid_paid,
      payment_status,
      cashier // Update cashier information
    }, { new: true });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    return res.status(200).send({ message: 'Transaction updated', data: transaction });

  } catch (error) {
    console.error(error);
    return res.status(500).send('Server Error');
  }
});

// Delete Transaction
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Transaction.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    return res.status(200).json({ message: 'Transaction deleted Successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server Error');
  }
});

router.put('/:transactionId/replace-units', async (req, res) => {
  try {
      const { transactionId } = req.params;
      const { products, rmaId } = req.body;

      // Validate input
      if (!products || products.length === 0) {
          return res.status(400).json({ message: 'Products are required for replacement.' });
      }

      // Find the transaction by its transaction_id
      const transaction = await Transaction.findOne({ transaction_id: transactionId });

      // Check if transaction exists
      if (!transaction) {
          return res.status(404).json({ message: 'Transaction not found.' });
      }

      // Loop through each product to update the serial numbers
      for (const { old_serial_number, new_serial_number } of products) {
          // Find the product in the transaction's products array
          const productToUpdate = transaction.products.find(product => product.serial_number.includes(old_serial_number));

          // If the product with the old serial number exists, update it
          if (productToUpdate) {
              // Update the old serial number status to 'replaced'
              const updateOldUnit = await Product.updateOne(
                  { 'units.serial_number': old_serial_number },
                  { $set: { 'units.$.status': 'replaced' } }
              );

              if (updateOldUnit.nModified === 0) {
                  return res.status(500).json({ message: `Failed to update status for old unit ${old_serial_number}.` });
              }

              // Update the product's serial_number to the new serial number
              productToUpdate.serial_number = new_serial_number;

              // Update the new serial number status to 'in_stock'
              const updateNewUnit = await Product.updateOne(
                  { 'units.serial_number': new_serial_number },
                  { $set: { 'units.$.status': 'sold' } }
              );

              if (updateNewUnit.nModified === 0) {
                  return res.status(500).json({ message: `Failed to update status for new unit ${new_serial_number}.` });
              }

              // Update the RMA status for the current new_serial_number
              await RMA.updateOne(
                  { rma_id: rmaId }, // Assuming rmaId is passed in the request body
                  { $set: { status: 'Completed'} }
              );
          } else {
              return res.status(400).json({ message: `Serial number ${old_serial_number} not found in the transaction.` });
          }
      }

      // Update the transaction status to 'Replaced'
      transaction.status = 'Replaced';

      // Save the updated transaction
      await transaction.save();
      
      return res.status(200).json({ message: 'Units replaced successfully!', transaction });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error while processing replacement.', error: error.message });
  }
});











export default router;
