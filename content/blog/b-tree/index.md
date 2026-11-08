+++
title = 'Intro to Data Store Fundamentals: Deep Diving Into B-Tree'
description = 'Deep diving into B-Tree as fundamental of how data is stored in the database'
data = '2026-10-21'
draft = true
categories = ['article', 'storage', 'algorithm']
tags = ['performance', 'algorithm', 'data-structure']
+++

# Introduction

The main responsibility of the databases are to store data and make it accessible easily. But, if the data is being stored randomly, this make harder to manage it. The data should be stored using technics. One of the most successor of the technic is B-Tree. 

B-Tree In computer science, B-Tree is a self-balancing tree data structure that maintains sorted data and allows discovery, insertions, and deletions. B-Tree is adopting the binary search tree do, allowing a node to have more than one key and more than two children. By allowing this, the B-Tree reduces the height of the tree and puts the data in fewer separate blocks. By reduce the tree node, it reduce the latency and work with relative large blocks of data, hence the B-Tree's use in databases and file systems.

# B-Tree Structure
B-Tree is a self-balancing search tree designed specifically to store sorted data and operate efficiently on block of secondary storage (like SSD and hard disk drives). Unlike standard Binary Search Tree which hold only one key and two children per-node, B-Tree is generalized search tree with a high branching factor. A single node hold multiple keys and have many children, which keeps the tree height short and wider rather han tall and skinny.

B-Tree represented as a collection of three types of nodes: **root**, **leaf**, and **internal**. The top-most node called **root node**, while the nodes at the bottom level called **leaf**, and the other nodes called **internal nodes**. B-Tree of order **m** (where **m** is the maximum number of children any node can have) has following characteristics:

- **Node Capacity**: Every node contains at most `m - 1` keys.
- 

<!-- 
Sources:
https://planetscale.com/blog/btrees-and-database-indexes
https://courses.grainger.illinois.edu/cs225/fa2026/resources/btrees/
https://en.wikipedia.org/wiki/B-tree
https://www.programiz.com/dsa/b-tree
-->