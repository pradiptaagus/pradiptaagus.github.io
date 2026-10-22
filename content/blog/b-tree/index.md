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
B-Tree represented as a collection of three types of nodes: **root**, **leaf**, and **internal**. The top-most node called **root node**, while the nodes at the bottom level called **leaf nodes**, and the other nodes called **internal nodes**. A B-Tree of order **K** is a tree structure with the following properties:

- Each node inte tree stores N key/value pairs, where N is greater than 1 and less than or equal to **K**.
- Each internal node has at leash N/2 key/value pairs. 
- Each node has N+1 children.
- The root node has at leash one value and two children, unless it is the sole node.
- All leaves are on the same level.

<!-- 
Sources:
https://planetscale.com/blog/btrees-and-database-indexes
https://courses.grainger.illinois.edu/cs225/fa2026/resources/btrees/
https://en.wikipedia.org/wiki/B-tree
https://www.programiz.com/dsa/b-tree
-->